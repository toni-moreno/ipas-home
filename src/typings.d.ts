/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

interface ServiceSection {
  name: string;
  description: string;
  content: ServiceElement[]
}

interface ServiceElement {
  title: string;
  headerIcon: string;
  description: string;
  status?: any,
  linearColor : string,
  footContent : string,
  footerIcon: string,
  link: string
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




