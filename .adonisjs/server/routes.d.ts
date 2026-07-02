import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'itens.store': { paramsTuple?: []; params?: {} }
    'itens.index': { paramsTuple?: []; params?: {} }
    'compras.store': { paramsTuple?: []; params?: {} }
    'compras.index': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'itens.store': { paramsTuple?: []; params?: {} }
    'compras.store': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'itens.index': { paramsTuple?: []; params?: {} }
    'compras.index': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'itens.index': { paramsTuple?: []; params?: {} }
    'compras.index': { paramsTuple?: []; params?: {} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}