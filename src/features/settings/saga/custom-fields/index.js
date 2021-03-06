import { call, put, takeEvery } from 'redux-saga/effects';
import {
    settingsTriggerSpinner as spinner,
    setCustomFields,
    createFromCustomFields,
    updateFromCustomFields,
    removeFromCustomFields
} from '../../actions';
import * as queryStrings from 'query-string';
import Request from '@/api/request';
import { alertMe } from '@/constants';
import { ROUTES } from '@/navigation';
import { getTitleByLanguage } from '@/utils';
import {
    GET_CUSTOM_FIELDS,
    CREATE_CUSTOM_FIELD,
    EDIT_CUSTOM_FIELD,
    REMOVE_CUSTOM_FIELD,
    GET_CUSTOM_FIELD
} from '../../constants';

export function* getCustomFields({ payload }) {
    const {
        fresh = true,
        onSuccess,
        queryString,
        returnResponse = false
    } = payload;

    try {
        const options = {
            path: `custom-fields?${queryStrings.stringify(queryString)}`
        };

        const response = yield call([Request, 'get'], options);

        if (response?.customFields) {
            const { data } = response.customFields;
            yield put(setCustomFields({ customFields: data, fresh }));
        }

        onSuccess?.(response?.customFields);

        if (returnResponse) {
            return response?.customFields?.data ?? [];
        }
    } catch (e) {}
}

function* createCustomField({ payload: { params, navigation } }) {
    yield put(spinner({ customFieldLoading: true }));

    try {
        const options = {
            path: `custom-fields`,
            body: params
        };

        const response = yield call([Request, 'post'], options);

        if (response.success) {
            yield put(
                createFromCustomFields({ customField: response.customField })
            );
            navigation.goBack(null);
        }
    } catch (e) {
    } finally {
        yield put(spinner({ customFieldLoading: false }));
    }
}

function* getCustomField({ payload: { id, onResult = null } }) {
    yield put(spinner({ getCustomFieldLoading: true }));

    try {
        const options = { path: `custom-fields/${id}` };

        const response = yield call([Request, 'get'], options);

        if (response.customField) {
            onResult?.(response.customField);
        }
    } catch (e) {
    } finally {
        yield put(spinner({ getCustomFieldLoading: false }));
    }
}

function* editCustomField({ payload: { id, params, navigation } }) {
    yield put(spinner({ customFieldLoading: true }));

    try {
        const options = {
            path: `custom-fields/${id}`,
            body: params
        };

        const response = yield call([Request, 'put'], options);

        if (response.success) {
            yield put(
                updateFromCustomFields({ customField: response.customField })
            );
            navigation.goBack(null);
        }

        if (response?.error === 'values_attached') {
            alertMe({
                desc: getTitleByLanguage('customFields.alreadyUsed')
            });
        }
    } catch (e) {
    } finally {
        yield put(spinner({ customFieldLoading: false }));
    }
}

function* removeCustomField({ payload: { id, navigation } }) {
    yield put(spinner({ removeCustomFieldLoading: true }));

    try {
        const options = { path: `custom-fields/${id}` };

        const response = yield call([Request, 'delete'], options);

        if (response.success) {
            yield put(removeFromCustomFields({ id }));
            navigation.goBack(null);
        }

        if (response?.error === 'values_attached') {
            alertMe({
                desc: getTitleByLanguage('customFields.alreadyUsed')
            });
        }
    } catch (e) {
    } finally {
        yield put(spinner({ removeCustomFieldLoading: false }));
    }
}

export default function* customFieldsSaga() {
    yield takeEvery(GET_CUSTOM_FIELDS, getCustomFields);
    yield takeEvery(CREATE_CUSTOM_FIELD, createCustomField);
    yield takeEvery(GET_CUSTOM_FIELD, getCustomField);
    yield takeEvery(EDIT_CUSTOM_FIELD, editCustomField);
    yield takeEvery(REMOVE_CUSTOM_FIELD, removeCustomField);
}
