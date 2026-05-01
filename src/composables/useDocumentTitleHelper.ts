export function useDocumentTitleHelper() {
  function setDocumentTitle(pageName: string) {
    document.title = `Simple Telly - ${pageName}`
  }

  return { setDocumentTitle }
}
