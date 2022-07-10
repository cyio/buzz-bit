// @ts-nocheck

import { HttpRequests, ApiRequestTypes, ContentType } from '@/utils/request'
import { isProd } from '@/utils/index'
import AppConfig from '@/config/'

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
    url: '/oauth2/oauth/token',
    params: params,
    host: AppConfig.showMoneyAuthUrl,
    options: {
      headers: {
        'Content-Type': ContentType.form
      },
      credentials: 'omit',
    }
  })
}
export const getBuzzList = (params): Promise<any> => {
  return callApi({
    url: '/aggregation/v2/app/buzz/getBuzzMyCustomizeList',
    params: params,
    options: {
      credentials: 'omit',
    }
  })
}
export const getFollowBuzzList = (params): Promise<any> => {
  return callApi({
    url: '/aggregation/v2/app/buzz/getBuzzFollowList',
    params: params,
    options: {
      credentials: 'omit',
    }
  })
}
export const getHotBuzzList = (params): Promise<any> => {
  return callApi({
    url: '/aggregation/v2/app/buzz/getBuzzHotList',
    params: params,
    options: {
      credentials: 'omit',
    }
  })
}
export const getNewBuzzList = (params): Promise<any> => {
  return callApi({
    url: '/aggregation/v2/app/buzz/getBuzzHomeList',
    params: params,
    options: {
      credentials: 'omit',
    }
  })
}
// https://api.showmoney.app/serviceapi/api/v1/showService/getOwnShowAccount
export const getOwnShowAccount = (params): Promise<any> => {
  return callApi({
    url: '/serviceapi/api/v1/showService/getOwnShowAccount',
    params: params,
    host: AppConfig.showMoneyUrl,
    options: {
      credentials: 'omit',
    }
  })
}
export const getProtocolDataList = (params): Promise<any> => {
  return callApi({
    url: '/serviceapi/api/v1/protocol/getProtocolDataList',
    params: params,
    host: AppConfig.showMoneyUrl,
    options: {
      credentials: 'omit',
    }
  })
}
export const queryNewNodePath = (params): Promise<any> => {
  return callApi({
    url: '/serviceapi/api/v1/showService/getPublicKeyForNewNode',
    params: params,
    host: AppConfig.showMoneyUrl,
    options: {
      credentials: 'omit',
    }
  })
}
export const getNewNodePath = async (data): Promise<any> => {
  const res = await callApi({
    url: '/serviceapi/api/v1/showService/getPublicKeyForNewNode',
    params: {
      data: JSON.stringify(data)
    },
    host: AppConfig.showMoneyUrl,
    options: {
      credentials: 'omit',
    }
  })
  if (res.msg === 'success') {
    return res.result.data
  }
  return []
}
export const getInteractiveBuzzList = (params): Promise<any> => {
  return callApi({
    url: '/aggregation/v2/app/buzz/getBuzzInteractiveList',
    params: params,
    options: {
      credentials: 'omit',
    }
  })
}
export const getBuzz = (params): Promise<any> => {
  return callApi({
    url: '/aggregation/v2/app/buzz/getOneBuzz',
    params: params,
    options: {
      credentials: 'omit',
    }
  })
}
export const getImageMetaFile = (params): Promise<any> => {
  return callApi({
    url: '/aggregation/v2/app/metaFile/getImageMetaFile',
    params: params,
    options: {
      credentials: 'omit',
    }
  })
}
export const getSearchBuzzList = (params): Promise<any> => {
  return callApi({
    url: '/aggregation/v2/app/search/getSearchContentBySearchWord',
    params: params,
    options: {
      credentials: 'omit',
    }
  })
}
export const getMetaAccessContent = (params): Promise<any> => {
  return callApi({
    url: '/metaaccess/api/v2/article/getMessage',
    params: params,
    options: {
      mode: 'cors',
      credentials: 'include',
      headers: {
        metaId: params.metaId
      },
    }
  })
}
export const queryTranslate = (params): Promise<any> => {
  return callApi({
    url: '/showpaycore/api/v1/i18n/translate',
    params: params,
    options: {
      mode: 'cors',
      credentials: 'include',
      headers: {
        metaId: params.metaId
      },
    }
  })
}
export const getUserFollow = (params): Promise<any> => {
  return callApi({
    url: '/aggregation/v2/app/follow/getMyFollow',
    params: params,
    options: {
      credentials: 'omit',
    }
  })
}

export const goAuth = () => {
  const authUrl = `${AppConfig.showMoneyAuthUrl}/userLogin?response_type=code&scope=app&client_id=${AppConfig.oauthSettings.clientId}&redirect_uri=${AppConfig.oauthSettings.redirectUri}`
  location.href= authUrl
  // window.open(authUrl)
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
