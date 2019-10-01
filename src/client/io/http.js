'use strict';

export const ResponseError = (message, statusCode) => ({
    message,
    statusCode
});

/* eslint-disable no-undef */
const baseUrl = (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '') + '/api';
/* eslint-enable */

const getData = async response => {
    try {
        return await response.json();
    } catch (e) {
        return undefined;
    }
};

const ensureAcceptHeader = (options = {}) => {
    const acceptHeader = {
        Accept: 'application/json'
    };
    if (!options?.headers) {
        return { ...options, headers: acceptHeader };
    } else if (!options.headers.Accept || !options.headers.accept) {
        return { ...options, headers: { ...acceptHeader, ...options.headers } };
    }
};

const get = async (url, options) => {
    const response = await fetch(url, ensureAcceptHeader(options));

    if (response.status >= 400) {
        throw ResponseError(response.statusText, response.status);
    }

    return {
        status: response.status,
        data: await getData(response)
    };
};

export const behandlingerFor = async aktorId => {
    return get(`${baseUrl}/behandlinger/`, {
        headers: { 'nav-person-id': aktorId }
    });
};

export const behandlingerIPeriode = async (fom, tom) => {
    return get(`${baseUrl}/behandlinger/periode/${fom}/${tom}`);
};

export const putFeedback = async feedback => {
    const response = await fetch(baseUrl + '/feedback', {
        method: 'PUT',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(feedback)
    });

    if (response.status !== 204) {
        throw ResponseError(response.statusText, response.status);
    }
};

export const getFeedback = async behandlingsId => {
    return get(`${baseUrl}/feedback/${behandlingsId}`);
};

export const getFeedbackList = async behandlingsIdList => {
    const parameterList = behandlingsIdList.map(id => `id=${id}`).join('&');
    return get(`${baseUrl}/feedback/list`);
};

export const downloadFeedback = params => {
    const query = params ? `?fraogmed=${params}` : '';
    window.open(`${baseUrl}/feedback${query}`, { target: '_blank' });
};

export const getPerson = async aktorId => {
    return get(`${baseUrl}/person/${aktorId}`);
};
