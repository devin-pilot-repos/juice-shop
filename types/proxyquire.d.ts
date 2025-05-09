declare module 'proxyquire' {
  function proxyquire(path: string, stubs: Record<string, any>): any;
  namespace proxyquire {
    function noCallThru(): typeof proxyquire;
    function callThru(): typeof proxyquire;
  }
  export = proxyquire;
}
