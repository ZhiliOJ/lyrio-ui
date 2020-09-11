import React, { useState, useEffect } from "react";
import { Header, Button, Form, Segment, Icon, Comment, Accordion, Divider, Label } from "semantic-ui-react";
import { observer } from "mobx-react";
import { FormattedMessage } from "react-intl";
import { useNavigation, Link } from "react-navi";
import replace from "string-replace-to-array";

import style from "./UserEdit.module.less";

import { UserApi } from "@/api";
import { appState } from "@/appState";
import { useIntlMessage } from "@/utils/hooks";
import { RouteError } from "@/AppRouter";
import UserAvatar from "@/components/UserAvatar";
import UserLink from "@/components/UserLink";
import { HighlightedCodeBox } from "@/components/CodeBox";
import formatDateTime from "@/utils/formatDateTime";
import fixChineseSpace from "@/utils/fixChineseSpace";
import Pagination from "@/components/Pagination";
import { UserMeta } from "@/interfaces/UserMeta";
import PseudoLink from "@/components/PseudoLink";
import { URLDescriptor } from "navi";
import copyToClipboard from "@/utils/copyToClipboard";

const AUDIT_LOGS_PER_PAGE = 10;

interface AuditQuery {
  actionQuery?: string;
  ip?: string;
  firstObjectId?: number;
  secondObjectId?: number;
  page?: number;
}

function normalizeQuery(rawQuery: Record<string, string>): AuditQuery {
  const result: AuditQuery = {
    actionQuery: rawQuery.actionQuery?.trim() ? rawQuery.actionQuery.trim().substr(0, 40) : null,
    ip: rawQuery.ip?.trim() ? rawQuery.ip.trim().substr(0, 45) : null,
    firstObjectId: Number.isSafeInteger(Number(rawQuery.firstObjectId)) ? Number(rawQuery.firstObjectId) : null,
    secondObjectId: Number.isSafeInteger(Number(rawQuery.secondObjectId)) ? Number(rawQuery.secondObjectId) : null,
    page: Number.isSafeInteger(Number(rawQuery.page)) ? Number(rawQuery.page) : null
  };
  return Object.fromEntries(Object.entries(result).filter(([key, value]) => value != null));
}

export async function fetchData(userId: number, rawQuery: Record<string, string>) {
  const query = normalizeQuery(rawQuery);
  const page = query.page || 1;

  const result = {
    query,
    response: {}
  };

  for (const { requestError, response } of await Promise.all([
    UserApi.getUserMeta({ userId }),
    UserApi.queryAuditLogs({
      userId: userId,
      actionQuery: query.actionQuery,
      ip: query.ip,
      firstObjectId: query.firstObjectId,
      secondObjectId: query.secondObjectId,
      skipCount: AUDIT_LOGS_PER_PAGE * (page - 1),
      takeCount: AUDIT_LOGS_PER_PAGE,
      locale: appState.locale
    })
  ])) {
    if (requestError) throw new RouteError(requestError, { showRefresh: true, showBack: true });
    else if (response.error) throw new RouteError(<FormattedMessage id={`user_edit.errors.${response.error}`} />);
    Object.assign(result.response, response);
  }

  return result;
}

interface AuditViewProps {
  query: AuditQuery;
  response: ApiTypes.QueryAuditLogsResponseDto & ApiTypes.GetUserMetaResponseDto;
}

const AuditView: React.FC<AuditViewProps> = props => {
  const _ = useIntlMessage("user_edit.audit");
  const navigation = useNavigation();

  useEffect(() => {
    appState.enterNewPage(`${_(`.title`)} - ${props.response.meta.username}`, false);
  }, [appState.locale]);

  const [actionQuery, setActionQuery] = useState(props.query.actionQuery);
  const [ip, setIp] = useState(props.query.ip);
  const [firstObjectId, setFirstObjectId] = useState(
    props.query.firstObjectId == null ? "" : props.query.firstObjectId.toString()
  );
  const [secondObjectId, setSecondObjectId] = useState(
    props.query.secondObjectId == null ? "" : props.query.secondObjectId.toString()
  );

  function getFilterUrl(queryOverride?: Partial<AuditQuery>): Partial<URLDescriptor> {
    const query: Partial<AuditQuery> = {};
    if (actionQuery) query.actionQuery = actionQuery;
    if (ip) query.ip = ip;
    if (firstObjectId !== "") query.firstObjectId = Number(firstObjectId);
    if (secondObjectId !== "") query.secondObjectId = Number(secondObjectId);

    return {
      query: Object.fromEntries(
        Object.entries({
          ...query,
          ...queryOverride
        }).map(([key, value]) => [key, value.toString()])
      )
    };
  }

  function onFilter(queryOverride?: Partial<AuditQuery>) {
    navigation.navigate(getFilterUrl(queryOverride));
  }

  function onPageChange(page: number) {
    navigation.navigate({
      query: Object.fromEntries(
        Object.entries({
          ...props.query,
          page
        }).map(([key, value]) => [key, value.toString()])
      )
    });
  }

  function renderObject(
    whichObject: 1 | 2,
    objectType: ApiTypes.QueryAuditLogsResponseItemDto["firstObjectType"],
    objectId: number,
    object: unknown
  ) {
    const wrap = (element: React.ReactNode) => (
      <div
        style={{ display: "inline-block" }}
        onClick={e => {
          e.stopPropagation();
          if (e.ctrlKey) {
            e.preventDefault();
            onFilter(
              whichObject === 1
                ? {
                    firstObjectId: objectId
                  }
                : {
                    secondObjectId: objectId
                  }
            );
          }
        }}
      >
        {element}
      </div>
    );

    if (!objectType) return null;
    if (!object)
      return wrap(
        <PseudoLink>
          Deleted {objectType} #{objectId}
        </PseudoLink>
      );

    switch (objectType) {
      case "User": {
        const user = object as UserMeta;
        return wrap(<UserLink user={user} />);
      }
      case "Group": {
        const group = object as ApiTypes.GroupMetaDto;
        return wrap(<PseudoLink>{group.name}</PseudoLink>);
      }
      case "Problem": {
        const [problem, title] = object as [ApiTypes.ProblemMetaDto, string];
        return wrap(
          problem.displayId ? (
            <Link href={`/problem/${problem.displayId}`}>
              #{problem.displayId}. {title}
            </Link>
          ) : (
            <Link href={`/problem/by-id/${problem.id}`}>
              P{problem.id}. {title}
            </Link>
          )
        );
      }
      case "ProblemTag": {
        const problemTag = object as ApiTypes.LocalizedProblemTagDto;
        return wrap(
          <Label
            size="small"
            content={problemTag.name}
            color={problemTag.color as any}
            as={Link}
            href={{
              pathname: "/problems",
              query: {
                tagIds: problemTag.id.toString()
              }
            }}
          />
        );
      }
      case "Submission": {
        return wrap(<Link href={`/submission/${objectId}`}>#{objectId}</Link>);
      }
      default:
        return wrap("Unknown object");
    }
  }

  return (
    <>
      <Header className={style.sectionHeader} size="large" content={_(".header")} />
      <Form className={style.queryForm}>
        <Form.Group inline className={style.autoFormGroup}>
          <div className={style.inputs}>
            <Form.Input
              className={style.inputActionQuery}
              icon="settings"
              iconPosition="left"
              placeholder={_(".query.action_query")}
              value={actionQuery}
              onChange={(e, { value }) => setActionQuery(value)}
            />
            <Form.Input
              className={style.inputIp}
              icon="wifi"
              iconPosition="left"
              placeholder={_(".query.ip")}
              value={ip}
              onChange={(e, { value }) => setIp(value)}
            />
            <Form.Input
              className={style.inputObjectId}
              icon="hashtag"
              iconPosition="left"
              placeholder={_(".query.first_object_id")}
              value={firstObjectId}
              onChange={(e, { value }) =>
                value === ""
                  ? setFirstObjectId("")
                  : Number.isSafeInteger(Number(value))
                  ? setFirstObjectId(value)
                  : null
              }
            />
            <Form.Input
              className={style.inputObjectId}
              icon="hashtag"
              iconPosition="left"
              placeholder={_(".query.second_object_id")}
              value={secondObjectId}
              onChange={(e, { value }) =>
                value === ""
                  ? setSecondObjectId("")
                  : Number.isSafeInteger(Number(value))
                  ? setSecondObjectId(value)
                  : null
              }
            />
          </div>
          <Button
            className={"labeled icon " + style.filterButton}
            icon="search"
            content={_(".query.filter")}
            onClick={() => onFilter()}
          />
        </Form.Group>
      </Form>
      {props.response.results.length === 0 ? (
        <Segment placeholder>
          {Object.values(props.query).some(x => x) ? (
            <>
              <Header icon>
                <Icon name="search" />
                {_(".no_matched_audit_log")}
              </Header>
              <Segment.Inline>
                <Button primary onClick={() => navigation.goBack()}>
                  {_(".goback")}
                </Button>
              </Segment.Inline>
            </>
          ) : (
            <>
              <Header icon>
                <Icon name="list alternate" />
                {_(".no_audit_log")}
              </Header>
            </>
          )}
        </Segment>
      ) : (
        <>
          <Comment.Group className={style.auditLogs}>
            {props.response.results.map((result, i) => (
              <React.Fragment key={i}>
                {i !== 0 && <Divider />}
                <Comment className={style.logItem}>
                  {/* Comment.Avatar */}
                  <div className="avatar">
                    <UserAvatar userAvatar={result.user.avatar} imageSize={70} />
                  </div>
                  <Comment.Content>
                    <Comment.Author>
                      <span className={style.user}>
                        <UserLink user={result.user} />
                      </span>
                      <span className={style.action}>
                        <Link href={getFilterUrl({ actionQuery: result.action })}>{result.action}</Link>
                      </span>
                    </Comment.Author>
                    <Comment.Text>
                      {(() => {
                        const message = (replace(
                          _(`user_audit.${result.action}`),
                          /\[(.+)\]/g,
                          (match: string, key: string) => {
                            switch (key) {
                              case "firstObject":
                                return renderObject(
                                  1,
                                  result.firstObjectType,
                                  result.firstObjectId,
                                  result.firstObject
                                );
                              case "secondObject":
                                return renderObject(
                                  1,
                                  result.secondObjectType,
                                  result.secondObjectId,
                                  result.secondObject
                                );
                              default:
                                return null;
                            }
                          }
                        ) as React.ReactNode[]).map((node, i) => <React.Fragment key={i}>{node}</React.Fragment>);

                        return result.details && Object.keys(result.details) ? (
                          <Accordion
                            panels={[
                              {
                                key: "",
                                title: {
                                  className: style.message,
                                  content: <span>{message}</span>
                                },
                                content: {
                                  content: (
                                    <HighlightedCodeBox
                                      segmentClassName={style.codeboxSegment}
                                      code={JSON.stringify(result.details, null, 2)}
                                      language="json"
                                    >
                                      <div
                                        className={style.copyDetailsJson}
                                        title={_(".copy_details")}
                                        onClick={() => copyToClipboard(JSON.stringify(result.details, null, 2))}
                                      >
                                        <Icon name="copy" />
                                      </div>
                                    </HighlightedCodeBox>
                                  )
                                }
                              }
                            ]}
                          />
                        ) : (
                          <div className={style.message}>{message}</div>
                        );
                      })()}
                    </Comment.Text>
                    <Comment.Actions className={style.info}>
                      <Comment.Action as={Link} className={style.item} href={getFilterUrl({ ip: result.ip })}>
                        {result.ip}
                      </Comment.Action>
                      <Comment.Action className={style.item} as="span">
                        {fixChineseSpace(result.ipLocation)}
                      </Comment.Action>
                      <Comment.Action className={style.item} as="span">
                        {formatDateTime(result.time)[1]}
                      </Comment.Action>
                    </Comment.Actions>
                  </Comment.Content>
                </Comment>
              </React.Fragment>
            ))}
          </Comment.Group>
          {props.response.count <= AUDIT_LOGS_PER_PAGE ? null : (
            <div className={style.pagination}>
              <Pagination
                totalCount={props.response.count}
                currentPage={props.query.page || 1}
                itemsPerPage={AUDIT_LOGS_PER_PAGE}
                onPageChange={onPageChange}
              />
            </div>
          )}
        </>
      )}
    </>
  );
};

export const View = observer(AuditView);