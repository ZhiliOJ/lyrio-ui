return {
  title: "問題",
  meta_labels: {
    non_public: "非表示",
    no_display_id: "ID なし"
  },
  fileio: {
    fileio: "ファイル IO",
    input: "入力ファイル",
    output: "出力ファイル"
  },
  show_tags: "タグを表示",
  hide_tags: "タグを隠す",
  type: {
    Traditional: "Batch",
    Interaction: "[TBT] Interaction",
    SubmitAnswer: "[TBT] Submit Answer"
  },
  statistic: {
    submissions: "提出",
    accepted: "正解"
  },
  action: {
    submit: "提出",
    login_to_submit: "ログインして提出してください",
    submission: "提出一覧",
    statistics: "統計",
    discussion: "ディスカッション",
    files: "ファイル",
    edit: "編集",
    judge_settings: "ジャッジ設定",
    permission_manage: "権限管理",
    permission_manager_description: "問題 {idString}",
    set_display_id: "問題 ID を設定",
    set_display_id_new: "新しい ID（空または 0 で削除する）",
    set_display_id_submit: "設定",
    set_public: "公開",
    set_non_public: "非公開",
    set_public_confirm: "公開する",
    set_non_public_confirm: "非公開にする",
    delete: "削除",
    delete_confirm_title: "[TBT] Delete Problem",
    delete_confirm_content:
      "[TBT] Are you sure to delete the problem? The submissions, discussions and files of the problem will also be deleted. It may take some time.",
    delete_confirm: "[TBT] Confirm delete",
    delete_cancel: "[TBT] Cancel",
    delete_success: "[TBT] Successfully deleted."
  },
  error: {
    PERMISSION_DENIED: "権限がありません。",
    NO_SUCH_PROBLEM: "問題が存在しません。",
    NO_DISPLAY_ID: "ID を設定してください。",
    INVALID_DISPLAY_ID: "ID は整数にしてください。",
    PUBLIC_PROBLEM_MUST_HAVE_DISPLAY_ID: "公開する問題には ID を設定してください。",
    DUPLICATE_DISPLAY_ID: "ID {displayId} は使用されています。"
  },
  upload_error: "[TBT] Failed to upload file: {error}",
  submit: {
    // This must be at most than full-width character characters e.g. "上次提交"
    last_submission: "[TBT] Last Sub.",
    back_to_statement: "戻る",
    skip_samples: "サンプルをスキップする",
    upload_files: "[TBT] Upload files",
    choose_files: "[TBT] Choose ...",
    selected_archive: "[TBT] Selected a archive file.",
    selected_valid_files: "[TBT] Selected {all} file(s). {valid} of them are valid.",
    selected_files: "[TBT] Selected {all} file(s).",
    cancel_select_files: "[TBT] Cancel selected files",
    clear_editor_to_use_upload_left: "[TBT] To use file uploading, please ",
    clear_editor: "[TBT] clear the editor(s)",
    clear_editor_to_use_upload_right: "[TBT] .",
    fill_in_editor_or_upload_file: "[TBT] Fill in the editor(s) with your answer or upload file(s).",
    submit: "提出"
  },
  permission_level: {
    limited: "limited",
    read: "read",
    write: "write"
  },
  sample: {
    input: "入力",
    output: "出力",
    copy: "コピー",
    copied: "コピーに成功しました",
    failed_to_copy: "コピーに失敗しました"
  }
};
