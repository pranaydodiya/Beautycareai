import {
  SKINCARE_TIP_LIST_REQUEST,
  SKINCARE_TIP_LIST_SUCCESS,
  SKINCARE_TIP_LIST_FAIL,
  SKINCARE_TIP_DETAILS_REQUEST,
  SKINCARE_TIP_DETAILS_SUCCESS,
  SKINCARE_TIP_DETAILS_FAIL,
  SKINCARE_TIP_LIKE_REQUEST,
  SKINCARE_TIP_LIKE_SUCCESS,
  SKINCARE_TIP_LIKE_FAIL,
  SKINCARE_TIP_CATEGORIES_REQUEST,
  SKINCARE_TIP_CATEGORIES_SUCCESS,
  SKINCARE_TIP_CATEGORIES_FAIL,
  SKINCARE_TIP_CONCERNS_REQUEST,
  SKINCARE_TIP_CONCERNS_SUCCESS,
  SKINCARE_TIP_CONCERNS_FAIL,
} from "../constants/skincareTipConstants";

export const skincareTipListReducer = (state = { tips: [] }, action) => {
  switch (action.type) {
    case SKINCARE_TIP_LIST_REQUEST:
      return { loading: true, tips: [] };
    case SKINCARE_TIP_LIST_SUCCESS:
      return {
        loading: false,
        tips: action.payload.tips,
        page: action.payload.page,
        pages: action.payload.pages,
        total: action.payload.total,
      };
    case SKINCARE_TIP_LIST_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

export const skincareTipDetailsReducer = (state = { tip: {} }, action) => {
  switch (action.type) {
    case SKINCARE_TIP_DETAILS_REQUEST:
      return { loading: true, ...state };
    case SKINCARE_TIP_DETAILS_SUCCESS:
      return { loading: false, tip: action.payload };
    case SKINCARE_TIP_DETAILS_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

export const skincareTipLikeReducer = (state = {}, action) => {
  switch (action.type) {
    case SKINCARE_TIP_LIKE_REQUEST:
      return { loading: true };
    case SKINCARE_TIP_LIKE_SUCCESS:
      return { loading: false, success: true, likes: action.payload.likes };
    case SKINCARE_TIP_LIKE_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

export const skincareTipCategoriesReducer = (state = { categories: [] }, action) => {
  switch (action.type) {
    case SKINCARE_TIP_CATEGORIES_REQUEST:
      return { loading: true, categories: [] };
    case SKINCARE_TIP_CATEGORIES_SUCCESS:
      return { loading: false, categories: action.payload };
    case SKINCARE_TIP_CATEGORIES_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

export const skincareTipConcernsReducer = (state = { concerns: [] }, action) => {
  switch (action.type) {
    case SKINCARE_TIP_CONCERNS_REQUEST:
      return { loading: true, concerns: [] };
    case SKINCARE_TIP_CONCERNS_SUCCESS:
      return { loading: false, concerns: action.payload };
    case SKINCARE_TIP_CONCERNS_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};
