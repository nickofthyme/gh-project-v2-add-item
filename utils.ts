import * as dotenv from 'dotenv'
import axios, { AxiosResponse } from 'axios';
import { get } from 'lodash';

dotenv.config()

interface QGLResponseData {
  errors?: any[] | null;
  data: any;
}

export const graphql = async <R = any>(query: string, variables: any = {}, path?: string, successStatus = 200): Promise<R> => {
  const response = await axios({
    url: `https://api.github.com/graphql`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
    },
    data: {
      query,
      variables: {
        org: 'elastic',
        repo: 'elastic-charts',
        projectId: '<Project Id>',
        projectNumber: 1141,
        ...variables
      },
    },
  }) as AxiosResponse<QGLResponseData>;

  if (response.status !== successStatus) {
    console.log('--------- Error ---------');
    if (response.data.errors) {
      throw response.data.errors;
    }

    throw `Response returned status ${response.status} (${response.statusText}), expected ${successStatus}`;
  }

  if (path) {
    return get(response.data, path) as R;
  }
  return (response.data as unknown) as R;
}

export const print = (v) => console.log(JSON.stringify(v, null, 2))
export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
