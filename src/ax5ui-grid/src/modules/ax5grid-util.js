
// ax5.ui.grid.util
(function (root) {
    "use strict";

    /**
     * @method ax5grid.util.divideTableByFrozenColumnIndex
     * @param table
     * @param frozenColumnIndex
     * @returns {{leftHeaderData: {rows: Array}, headerData: {rows: Array}}}
     */
    var divideTableByFrozenColumnIndex = function (table, frozenColumnIndex) {
        var tempTable_l = {rows: []};
        var tempTable_r = {rows: []};
        for (var r = 0, rl = table.rows.length; r < rl; r++) {
            var row = table.rows[r];

            tempTable_l.rows[r] = {cols: []};
            tempTable_r.rows[r] = {cols: []};

            for (var c = 0, cl = row.cols.length; c < cl; c++) {
                var col = jQuery.extend({}, row.cols[c]);
                var colStartIndex = col.colIndex, colEndIndex = col.colIndex + col.colspan;

                if (colStartIndex < frozenColumnIndex) {
                    if (colEndIndex <= frozenColumnIndex) {
                        // 좌측편에 변형없이 추가
                        tempTable_l.rows[r].cols.push(col);
                    } else {
                        var leftCol = jQuery.extend({}, col);
                        var rightCol = jQuery.extend({}, leftCol);
                        leftCol.colspan = frozenColumnIndex - leftCol.colIndex;
                        rightCol.colIndex = frozenColumnIndex;
                        rightCol.colspan = col.colspan - leftCol.colspan;

                        tempTable_l.rows[r].cols.push(leftCol);
                        tempTable_r.rows[r].cols.push(rightCol);
                    }
                }
                else {
                    // 오른편
                    tempTable_r.rows[r].cols.push(col);
                }
            }
        }

        return {
            leftData: tempTable_l,
            rightData: tempTable_r
        }
    };

    root.util = {
        divideTableByFrozenColumnIndex: divideTableByFrozenColumnIndex
    };

})(ax5.ui.grid);