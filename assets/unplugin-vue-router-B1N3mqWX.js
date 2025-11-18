function m(e,...s){return s.reduce((t,a)=>{const n=Object.assign({},t.meta,a.meta),i=[].concat(t.alias||[],a.alias||[]);return Object.assign(t,a),t.meta=n,t.alias=i,t},e)}export{m as _};
