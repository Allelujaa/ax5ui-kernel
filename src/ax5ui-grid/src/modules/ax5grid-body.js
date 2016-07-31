// ax5.ui.grid.body
(function () {
    "use strict";

    var GRID = ax5.ui.grid;
    var U = ax5.util;

    var init = function () {
        // 바디 초기화
        this.bodyRowTable = {};
        this.leftBodyRowData = {};
        this.bodyRowData = {};
        this.rightBodyRowData = {};

        // this.bodyRowMap = {};
        this.bodyRowTable = makeBodyRowTable.call(this, this.columns);

        // set oneRowHeight = this.bodyTrHeight
        // 바디에 표현될 한줄의 높이를 계산합니다.
        this.xvar.bodyTrHeight = this.bodyRowTable.rows.length * this.config.body.columnHeight;
    };

    var makeBodyRowTable = function (columns) {
        var table = {
            rows: []
        };
        var colIndex = 0;
        var maekRows = function (_columns, depth, parentField) {
            var row = {cols: []};
            var i = 0, l = _columns.length;


            var selfMakeRow = function (__columns) {
                var i = 0, l = __columns.length;
                for (; i < l; i++) {
                    var field = __columns[i];
                    var colspan = 1;

                    if (!field.hidden) {

                        if ('key' in field) {
                            field.colspan = 1;
                            field.rowspan = 1;

                            field.rowIndex = depth;
                            field.colIndex = (function () {
                                if (!parentField) {
                                    return colIndex++;
                                } else {
                                    colIndex = parentField.colIndex + i + 1;
                                    return parentField.colIndex + i;
                                }
                            })();

                            row.cols.push(field);
                            if ('columns' in field) {
                                colspan = maekRows(field.columns, depth + 1, field);
                            }
                            field.colspan = colspan;
                        }
                        else {
                            if ('columns' in field) {
                                selfMakeRow(field.columns, depth);
                            }
                        }
                    } else {

                    }
                }
            };

            for (; i < l; i++) {
                var field = _columns[i];
                var colspan = 1;

                if (!field.hidden) {

                    if ('key' in field) {
                        field.colspan = 1;
                        field.rowspan = 1;

                        field.rowIndex = depth;
                        field.colIndex = (function () {
                            if (!parentField) {
                                return colIndex++;
                            } else {
                                colIndex = parentField.colIndex + i + 1;
                                return parentField.colIndex + i;
                            }
                        })();

                        row.cols.push(field);
                        if ('columns' in field) {
                            colspan = maekRows(field.columns, depth + 1, field);
                        }
                        field.colspan = colspan;
                    }
                    else {
                        if ('columns' in field) {
                            selfMakeRow(field.columns, depth);
                        }
                    }
                } else {

                }
            }

            if (row.cols.length > 0) {
                if (!table.rows[depth]) {
                    table.rows[depth] = {cols: []};
                }
                table.rows[depth].cols = table.rows[depth].cols.concat(row.cols);
                return (row.cols.length - 1) + colspan;
            } else {
                return colspan;
            }

        };
        maekRows(columns, 0);

        (function () {
            // set rowspan
            for (var r = 0, rl = table.rows.length; r < rl; r++) {
                var row = table.rows[r];
                for (var c = 0, cl = row.cols.length; c < cl; c++) {
                    var col = row.cols[c];
                    if (!('columns' in col)) {
                        col.rowspan = rl - r;
                    }
                }
            }
        })();

        return table;
    };

    var repaint = function () {
        var cfg = this.config;
        var dividedBodyRowObj = GRID.util.divideTableByFrozenColumnIndex(this.bodyRowTable, this.config.frozenColumnIndex);
        var asideBodyRowData = this.asideBodyRowData = (function (dataTable) {
            var data = {rows:[]};
            for (var i = 0, l = dataTable.rows.length; i < l; i++) {
                data.rows[i] = {cols:[]};
                if(i === 0){
                    var col = {
                        width: cfg.asideColumnWidth,
                        _width: cfg.asideColumnWidth,
                        label: "",
                        colspan: 1,
                        rowspan: dataTable.rows.length,
                        colIndex: null
                    }, _col = {};

                    if (cfg.showLineNumber) {
                        _col = jQuery.extend({}, col, {label: "&nbsp;", key: "__d-index__"});
                        data.rows[i].cols.push(_col);
                    }
                    if (cfg.showRowSelector) {
                        _col = jQuery.extend({}, col, {label: "", key: "__d-checkbox__"});
                        data.rows[i].cols.push(_col);
                    }
                }
            }

            return data;
        }).call(this, this.bodyRowTable);
        var leftBodyRowData = this.leftBodyRowData = dividedBodyRowObj.leftData;
        var bodyRowData = this.bodyRowData = dividedBodyRowObj.rightData;

        var data = this.data;
        var paintRowCount = Math.ceil(this.$.panel["body"].height() / this.xvar.bodyTrHeight);
        var paintStartRowIndex = Math.floor(Math.abs(this.$.panel["body-scroll"].position().top) / this.xvar.bodyTrHeight);
        
        this.xvar.scrollContentHeight = this.xvar.bodyTrHeight * (this.data.length - this.config.frozenRowIndex);
        // todo : 현재 화면에 출력될 범위를 연산하여 data를 결정.
        // body-scroll 의 포지션에 의존적이므로..

        var repaintBody = function (_elTarget, _colGroup, _bodyRow, _data) {
            var SS = [];
            var cgi, cgl;
            var di, dl;
            var tri, trl;
            var ci, cl;
            var col, cellHeight, tdCSS_class;
            var getFieldValue = function(data, index, key){
                if(key === "__d-index__"){
                    return index + 1;
                }
                else if(key === "__d-checkbox__"){
                    return "C";
                }
                else{
                    return data[key] || "&nbsp;";
                }
            };
            SS.push('<table border="0" cellpadding="0" cellspacing="0">');
            SS.push('<colgroup>');
            for (cgi = 0, cgl = _colGroup.length; cgi < cgl; cgi++) {
                SS.push('<col style="width:' + _colGroup[cgi]._width + 'px;"  />');
            }
            SS.push('<col  />');
            SS.push('</colgroup>');

            for (di = paintStartRowIndex, dl = (function () {
                var len;
                len = _data.length;
                if (paintRowCount + paintStartRowIndex < len) {
                    len = paintRowCount + paintStartRowIndex;
                }
                return len;
            })(); di < dl; di++) {
                for (tri = 0, trl = _bodyRow.rows.length; tri < trl; tri++) {
                    SS.push('<tr class="tr-' + (di % 4) + '" data-ax5grid-data-index="' + di + '">');
                    for (ci = 0, cl = _bodyRow.rows[tri].cols.length; ci < cl; ci++) {
                        col = _bodyRow.rows[tri].cols[ci];
                        cellHeight = cfg.body.columnHeight * col.rowspan - cfg.body.columnBorderWidth;
                        tdCSS_class = "";
                        if (cfg.body.columnBorderWidth) tdCSS_class += "hasBorder ";
                        if (ci == cl - 1) tdCSS_class += "isLastColumn ";

                        SS.push('<td ',
                            'data-ax5grid-column-row="' + tri + '" ',
                            'data-ax5grid-column-col="' + ci + '" ',
                            'data-ax5grid-data-index="' + di + '" ',
                            'colspan="' + col.colspan + '" rowspan="' + col.rowspan + '" ',
                            'class="' + tdCSS_class + '" ',
                            'style="height: ' + cellHeight + 'px;min-height: 1px;">');

                        SS.push((function () {
                            var lineHeight = (cfg.body.columnHeight - cfg.body.columnPadding * 2 - cfg.body.columnBorderWidth);
                            if (col.multiLine) {
                                return '<span data-ax5grid-cellHolder="multiLine" style="height:' + cellHeight + 'px;line-height: ' + lineHeight + 'px;">';
                            } else {
                                return '<span data-ax5grid-cellHolder="" style="height: ' + (cfg.body.columnHeight - cfg.body.columnBorderWidth) + 'px;line-height: ' + lineHeight + 'px;">';
                            }
                        })(), getFieldValue.call(this, _data[di], di, col.key), '</span>');

                        SS.push('</td>');
                    }
                    SS.push('<td ',
                        'data-ax5grid-column-row="null" ',
                        'data-ax5grid-column-col="null" ',
                        'data-ax5grid-data-index="' + di + '" ',
                        'style="height: ' + (cfg.body.columnHeight) + 'px;min-height: 1px;" ',
                        '></td>');
                    SS.push('</tr>');
                }
            }
            SS.push('</table>');

            _elTarget.html(SS.join(''));
        };

        if (cfg.asidePanelWidth > 0) {
            if (cfg.frozenRowIndex > 0) {
                // 상단 행고정
                repaintBody(this.$.panel["top-aside-body"], this.asideColGroup, asideBodyRowData, data);
            }

            repaintBody(this.$.panel["aside-body-scroll"], this.asideColGroup, asideBodyRowData, data);

            if (cfg.footSum) {
                // 바닥 합계
                repaintBody(this.$.panel["bottom-aside-body"], this.asideColGroup, asideBodyRowData, data);
            }
        }


        if (cfg.frozenRowIndex > 0) {
            // 상단 행고정
        }

        if (cfg.frozenColumnIndex > 0) {
            repaintBody(this.$.panel["left-body-scroll"], this.leftHeaderColGroup, leftBodyRowData, data);
        }
        repaintBody(this.$.panel["body-scroll"], this.headerColGroup, bodyRowData, data);

        if (cfg.rightSum) {

        }

        if (cfg.footSum) {
            // 바닥 합계
        }
    };

    var setData = function () {

    };

    GRID.body = {
        init: init,
        repaint: repaint,
        setData: setData
    };
})();