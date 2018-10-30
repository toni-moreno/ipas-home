/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

interface ServiceElement {
  ID: string,
  Label: string,
  HeaderIcon: string,
  LinearColor: string,
  FootContent: string,
  FooterIcon: string,
  Link: string,
  Description: string,
  StatusMode: string,
  StatusURL: string,
  StatusContentType: string,
  StatusValidationMode: string,
  StatusValidationValue: string
}


interface StatusCard {
  ServiceStat: string,
  ServiceElapsed: number,
  ServiceError: string,
}

interface ProductElement {
  name: string;
  engine: string; 
  gather: boolean;
  visual: boolean;
  alert: boolean;
}

interface EngineElement {
  name: string;
  type: string;
}

interface SnmpCollectorElement {
  PRODUCT_DEVICE_PORT: number;
  PRODUCT_SYSTEMOID: string;
}

interface ProductFull {
  product: string;
  description: string;
  models: string;
  gather: Array<any>
  visual: Array<any>
  alert: Array<any>
}


interface DeviceList {
  id: string,
  host: string,
  tags: any,
  products: any
}