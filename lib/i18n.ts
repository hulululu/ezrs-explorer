export type AppLanguage = "ko" | "en";

export const UI_COPY = {
  ko: {
    header: {
      product: "Explorer",
      badge: "Demo",
      notSignedIn: "로그인 안 됨",
      login: "로그인",
      logout: "로그아웃",
      authOff: "인증 꺼짐",
      loginTitle: "Google로 로그인",
      authOffTitle: "Firebase 인증이 설정되지 않았습니다.",
      showSearchPanel: "검색 패널 열기",
      switchLanguage: "언어 전환",
      firebaseMissing: "Firebase 인증이 설정되지 않았습니다.",
      loginFailed: "로그인에 실패했습니다.",
      logoutFailed: "로그아웃에 실패했습니다."
    },
    status: {
      loading: "불러오는 중...",
      error: "오류"
    },
    search: {
      title: "검색",
      badge: "필터",
      product: "제품",
      allProducts: "(전체)",
      dateStart: "시작일",
      dateEnd: "종료일",
      datePlaceholder: "YYYY-MM-DD",
      roiBBox: "ROI BBox",
      minLon: "최소 경도",
      minLat: "최소 위도",
      maxLon: "최대 경도",
      maxLat: "최대 위도",
      search: "검색",
      note1: "Phase 1: STAC mock metadata",
      note2: "Quicklook과 footprint 기반 검색 결과입니다.",
      hidePanel: "검색 패널 숨기기"
    },
    results: {
      title: "결과",
      items: "개 항목",
      page: "페이지",
      emptyBefore: "검색 조건을 설정한 뒤 검색을 눌러 결과를 불러오세요.",
      emptyAfter: "결과가 없습니다.",
      prev: "이전",
      next: "다음",
      noPreview: "미리보기 없음",
      dateTo: "~"
    },
    map: {
      roiToggleTitle: "ROI 편집 모드 전환",
      roiOn: "ON",
      roiOff: "OFF",
      done: "완료",
      doneTitle: "ROI 편집 종료",
      resetRoi: "ROI 초기화",
      resetRoiTitle: "ROI를 기본값으로 초기화",
      roiHelp: "ROI 모드 ON: 지도 위에서 드래그해 bbox를 지정하세요.",
      hideResults: "결과 숨기기",
      showResults: "결과 보기",
      overlay: "오버레이",
      selected: "선택",
      none: "없음",
      roiMode: "ROI 모드"
    },
    helper: {
      tip: "Tip: ROI ON을 켜고 지도 위에서 드래그하면 bounding box를 지정할 수 있습니다.",
      selectedId: "선택 ID",
      selectedScene: "선택 Scene"
    }
  },
  en: {
    header: {
      product: "Explorer",
      badge: "Demo",
      notSignedIn: "Not signed in",
      login: "Login",
      logout: "Logout",
      authOff: "Auth Off",
      loginTitle: "Sign in with Google",
      authOffTitle: "Firebase auth is not configured.",
      showSearchPanel: "Show search panel",
      switchLanguage: "Switch language",
      firebaseMissing: "Firebase auth is not configured.",
      loginFailed: "Failed to login",
      logoutFailed: "Failed to logout"
    },
    status: {
      loading: "Loading...",
      error: "Error"
    },
    search: {
      title: "Search",
      badge: "Filters",
      product: "Product",
      allProducts: "(All)",
      dateStart: "Date start",
      dateEnd: "Date end",
      datePlaceholder: "YYYY-MM-DD",
      roiBBox: "ROI BBox",
      minLon: "Min Lon",
      minLat: "Min Lat",
      maxLon: "Max Lon",
      maxLat: "Max Lat",
      search: "Search",
      note1: "Phase 1: STAC mock metadata",
      note2: "Search results use quicklooks and footprints.",
      hidePanel: "Hide search panel"
    },
    results: {
      title: "Results",
      items: "items",
      page: "Page",
      emptyBefore: "Set search filters, then press Search to load results.",
      emptyAfter: "No results",
      prev: "Prev",
      next: "Next",
      noPreview: "No preview",
      dateTo: "to"
    },
    map: {
      roiToggleTitle: "Toggle ROI edit mode",
      roiOn: "ON",
      roiOff: "OFF",
      done: "Done",
      doneTitle: "Stop ROI edit mode",
      resetRoi: "Reset ROI",
      resetRoiTitle: "Reset ROI to default",
      roiHelp: "ROI mode ON: drag on map to set bbox.",
      hideResults: "Hide Results",
      showResults: "Show Results",
      overlay: "Overlay",
      selected: "Selected",
      none: "None",
      roiMode: "ROI mode"
    },
    helper: {
      tip: "Tip: Turn ROI ON and drag on the map to set a bounding box.",
      selectedId: "Selected ID",
      selectedScene: "Selected Scene"
    }
  }
} as const;

export type AppCopy = (typeof UI_COPY)[AppLanguage];
