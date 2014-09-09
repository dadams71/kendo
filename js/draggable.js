// JavaScript Document

$(document).ready(function () {

    var tableContent = kendo.template("<li id='#: ProductName+-+ProductID #' class='draggable' >#: ProductName #</li>");
    var fixedColumn = kendo.template(" <li id='#: ProductName+-+ProductID #' class='draggable'>#: ProductName  #</li>");
    var dropArea = kendo.template(" <div class='droparea'>#: UnitPrice #</div>");

    var cloned = kendo.template("<div id='#= dragID #>I am the blob</div> ");
    var data = { dragID: "ProductName" };
    var draggableID = cloned(data);

    //var inlineData = { ProductName: "ProductName", ProductID: "ProductID" };
    //$("#inline").html(tableContent(inlineData));

    $("#grid").kendoGrid({
        dataSource: {
            data: products,
            schema: {
                model: {
                    fields: {
                        ProductName: { type: "string" },
                        UnitPrice: { type: "number" },
                        UnitsInStock: { type: "number" },
                        Discontinued: { type: "boolean" },
                        QuantityPerUnit: { type: "string" }
                    }
                }
            },


            pageSize: 30
        },
        height: 540,
        sortable: true,
        reorderable: true,
        groupable: false,
        resizable: true,
        filterable: false,
        columnMenu: true,
        pageable: true,
        columns: [

                            {
                                //field: "ProductName",
                                title: "Product Name",
                                locked: true,
                                width: 300,
                                template: fixedColumn
                            }, {
                                field: "UnitPrice",
                                title: "Unit Price",
                                format: "{0:c}",
                                width: 350,
                                template: dropArea
                            }, {
                                field: "UnitsInStock",
                                title: "Units In Stock",
                                width: 330
                            }, {
                                field: "Discontinued",
                                width: 230
                            }, {
                                field: "QuantityPerUnit",
                                title: "Quantity Per Unit",
                                width: 300
                            }
        ]
    });

    function draggableOnDragStart(e) {
        e.currentTarget.addClass("hollow");

        $("#droptarget").text("(Drop here)");
        //e.dropTarget.addClass("entering-area");
    }

    function droptargetOnDragEnter(e) {
        $("#droptarget").text("Now drop...");
        e.dropTarget.addClass("dropping-area");
    }

    function droptargetOnDragLeave(e) {
        e.dropTarget.removeClass("dropping-area")
        $("#droptarget").text("(Drop here)");
    }

    function droptargetOnDrop(e) {
        $("#droptarget").text("You did great!");
        $(".draggable").removeClass("hollow");
        e.dropTarget.removeClass("dropping-area");
    }

    function draggableOnDragEnd(e) {
        var draggable = $(".draggable");

        if (!draggable.data("kendoDraggable").dropped) {
            // drag ended outside of any droptarget
            $("#droptarget").text("Try again!");
        }

        draggable.removeClass("hollow");
    }

    $(document).ready(function () {
        $(".draggable").kendoDraggable({
            hint: function(element) {
                return element.clone().addClass("draggable-item");
            },
            dragstart: draggableOnDragStart,
            dragend: draggableOnDragEnd
        });

        $("#droptarget, .droparea").kendoDropTarget({
            dragenter: droptargetOnDragEnter,
            dragleave: droptargetOnDragLeave,
            drop: droptargetOnDrop
        });

        var draggable = $(".draggable").data("kendoDraggable");

        $("#cursorOffset").click(function (e) {
            if (this.checked) {
                draggable.options.cursorOffset = { top: 10, left: 10 };
            } else {
                draggable.options.cursorOffset = null;
            }
        });

        $("#axis").change(function (e) {
            draggable.options.axis = $(this).val();
        });
    });
});