import axios from "axios";
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

export const listSkincareTips = (params = {}) => async (dispatch) => {
  try {
    dispatch({ type: SKINCARE_TIP_LIST_REQUEST });

    // Normalize params: backend expects concerns as comma-separated string
    const normalized = { ...params };
    if (Array.isArray(normalized.concerns)) {
      normalized.concerns = normalized.concerns.join(',');
    }

    const { data } = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/skincare-tips`, { params: normalized });

    dispatch({
      type: SKINCARE_TIP_LIST_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: SKINCARE_TIP_LIST_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const getSkincareTipDetails = (id) => async (dispatch) => {
  try {
    dispatch({ type: SKINCARE_TIP_DETAILS_REQUEST });

    const { data } = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/skincare-tips/${id}`);

    dispatch({
      type: SKINCARE_TIP_DETAILS_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: SKINCARE_TIP_DETAILS_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const likeSkincareTip = (id) => async (dispatch) => {
  try {
    dispatch({ type: SKINCARE_TIP_LIKE_REQUEST });

    const { data } = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/skincare-tips/${id}/like`);

    dispatch({
      type: SKINCARE_TIP_LIKE_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: SKINCARE_TIP_LIKE_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const getSkincareTipCategories = () => async (dispatch) => {
  try {
    dispatch({ type: SKINCARE_TIP_CATEGORIES_REQUEST });

    const { data } = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/skincare-tips/categories`);

    dispatch({
      type: SKINCARE_TIP_CATEGORIES_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: SKINCARE_TIP_CATEGORIES_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const getSkincareTipConcerns = () => async (dispatch) => {
  try {
    dispatch({ type: SKINCARE_TIP_CONCERNS_REQUEST });

    const { data } = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/skincare-tips/concerns`);

    dispatch({
      type: SKINCARE_TIP_CONCERNS_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: SKINCARE_TIP_CONCERNS_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};
