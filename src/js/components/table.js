const select = require('../utils/select');

class ResponsiveTable {
    constructor (table) {
        this.insertHeaderAsAttributes(table);
    }

    // Add data attributes needed for responsive mode.
    insertHeaderAsAttributes (tableEl){
        if (!tableEl) return;

        let header =  tableEl.getElementsByTagName('thead');
        if(header.length !== 0) {
          let headerCellEls = header[ 0 ].getElementsByTagName('th');
          if (headerCellEls.length == 0) {
            headerCellEls = header[ 0 ].getElementsByTagName('td');
          }

          if (headerCellEls.length) {
            const bodyRowEls = select('tbody tr', tableEl);
            Array.from(bodyRowEls).forEach(rowEl => {
              let cellEls = rowEl.children;
              if (cellEls.length === headerCellEls.length) {
                Array.from(headerCellEls).forEach((headerCellEl, i) => {
                  // Grab header cell text and use it body cell data title.
                  if(!cellEls[ i ].hasAttribute('data-title') ){
                    cellEls[ i ].setAttribute('data-title', headerCellEl.textContent);
                  }
                });
              }
            });
          }
        }
    }
}

module.exports = ResponsiveTable;
