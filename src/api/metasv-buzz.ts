// @ts-nocheck

import { HttpRequests, ApiRequestTypes, ContentType } from '@/utils/request'
import { isProd } from '@/utils/index'
import AppConfig from '@/config/metasv-buzz'
// const AppConfig = {
//   showMoneyUrl: 'https://www.showmoney.app',  // Showmoney 钱包地址 - 不需要变动
//   oauthSettings: {
//     clientId: 'e6d94fe3-69ab-43a9-8988-3255e5957864',
//     clientSecret: 'af22ad2f-8bc8-45c2-b155-bd4ed6ee97bd',
//     redirectUri: 'http://localhost:8080/#/'
//   },
// }

interface GetTokenParamsTypes {
  grant_type: string;
  code: string;
  redirect_uri: string;
  scope: string;
  client_id: string;
  client_secret: string;
}
export interface QueryMetaIdDataParamsTypes {
  find: ObjTypes<any>;
  skip?: number;
  limit?: number;
  sort?: number;
  format?: string;
  startTime?: number;
  endTime?: number;
}
interface BaseListParamsTypes {
  page: string;
  pageSize: string;
}
interface MetaIdDataResTypes {
  page: number;
  pageSize: number;
  total: number;
  data: string;
}

const callApi = async (config: ApiRequestTypes): Promise<any> => {
  const Http = new HttpRequests()
  let url = AppConfig.showMoneyUrl + config.url
  if (config.host) {
    url = isProd ? config.host + config.url : config.url
  }
  const res = await Http.postFetch<any>(url, config.params, config.options)
  return res
}
export const getToken = (params: GetTokenParamsTypes): Promise<any> => {
  return callApi({
    url: '/api/oauth2/oauth/token',
    params: params,
    options: {
      headers: {
        'Content-Type': ContentType.form
      },
    }
  })
}
// https://api.showmoney.app/aggregation/v2/app/buzz/getBuzzMyCustomizeList
export const getBuzzList = (params): Promise<any> => {
  return callApi({
    url: '/aggregation/v2/app/buzz/getBuzzMyCustomizeList',
    host: 'https://api.showmoney.app/',
    params: params,
    options: {
      credentials: 'omit',
    }
  })
}
export const getFollowBuzzList = (params): Promise<any> => {
  return callApi({
    url: '/api/aggregation/v2/app/buzz/getBuzzFollowList',
    host: 'https://www.showbuzz.app/',
    params: params,
    options: {
      credentials: 'omit',
    }
  })
}
export const getHotBuzzList = (params): Promise<any> => {
  return callApi({
    url: '/api/aggregation/v2/app/buzz/getBuzzHotList',
    host: 'https://www.showbuzz.app/',
    params: params,
    options: {
      credentials: 'omit',
    }
  })
}
export const getNewBuzzList = (params): Promise<any> => {
  return callApi({
    url: '/api/aggregation/v2/app/buzz/getBuzzHomeList',
    host: 'https://www.showbuzz.app/',
    params: params,
    options: {
      credentials: 'omit',
    }
  })
}
export const getSearchBuzzList = (params): Promise<any> => {
  return callApi({
    url: '/aggregation/v2/app/search/getSearchContentBySearchWord',
    host: 'https://api.showmoney.app/',
    params: params,
    options: {
      credentials: 'omit',
    }
  })
}
export const goAuth = () => {
  const authUrl = `${AppConfig.showMoneyUrl}/userLogin?response_type=code&scope=app&client_id=${AppConfig.oauthSettings.clientId}&redirect_uri=${AppConfig.oauthSettings.redirectUri}`
  window.location.replace(authUrl)
}
export const getTagList = async (params: BaseListParamsTypes) => {
  const Http = new HttpRequests()
  const url = `${AppConfig.metaIdCenterUrl}/v2/app/tag/getTags`
  const res = await Http.postFetch<any>(url, params)
  return res
}
export const getTagBuzzIds = async (tag: string) => {
  const Http = new HttpRequests()
  const url = `${AppConfig.metaIdCenterUrl}/v2/app/tag/getTransactions`
  const res = await Http.postFetch<any>(url, { Tag: tag })
  return res
}
export const queryMetaIdData = (params: QueryMetaIdDataParamsTypes): Promise<any> => {
  const Http = new HttpRequests()
  const paramsB64 = btoa(JSON.stringify(params))
  const url = AppConfig.metaIdServiceUrl + '/showMANDB/api/v1/query/queryFindMetaData/' + paramsB64
  return Http.getFetch(url)
}
export const getUserInfoByMetaId = (metaId: string) => {
  const Http = new HttpRequests()
  const url = AppConfig.metaIdServiceUrl + '/showMANDB/api/v1/query/getMetaIDInfo/' + metaId
  return Http.getFetch(url)
}
export const getBuzzDetail = (buzzId: string) => {
  const params = {
    find: {
      txId: buzzId
    }
  }
  return queryMetaIdData(params)
}

export const getBuzzRelationData = (buzzId: string) => {
  const params = {
    find: {
      $or: [
        {
          parentNodeName: 'PayLike',
        },
        {
          parentNodeName: 'PayComment',
        },
        {
          parentNodeName: 'SimpleRePost',
        },
      ],
      $and: [
        {
          $or: [
            {
              'data.likeTo': buzzId,
            },
            {
              'data.commentTo': buzzId,
            },
            {
              'data.rePostTx': buzzId,
            },
          ]
        },
      ],
      metaId: AppConfig.metaIdTag,
    },
    limit: -1
  }
  return queryMetaIdData(params)
}

export const getUserFollowData = async (metaId: string) => {
  const params = {
    find: {
      parentNodeName: 'PayFollow',
      metaId: AppConfig.metaIdTag,
      $or: [
        {
          rootTxId: metaId
        },
        {
          'data.MetaID': metaId
        },
      ]
      // rootTxId: metaId
      // 'data.MetaID': metaId,
    },
    limit: -1,
  }
  const data: {
    follower: string[];
    following: string[];
  } = {
    follower: [],
    following: []
  }
  try {
    const res = await queryMetaIdData(params)
    if (res.code === 200) {
      res.result.data.forEach(el => {
        if (el.rootTxId === metaId) {
          data.following.push(el.data.MetaID)
        } else {
          data.follower.push(el.rootTxId)
        }
      })
    }
  } catch (error) {
    console.error(error)
  }
  // 去重
  data.following = Array.from(new Set(data.following))
  data.follower = Array.from(new Set(data.follower))
  return data
}
