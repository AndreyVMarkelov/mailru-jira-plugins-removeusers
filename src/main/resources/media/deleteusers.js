JIRA.UserAutoComplete = function(options) {

    // prototypial inheritance (http://javascript.crockford.com/prototypal.html)
    var that = begetObject(JIRA.RESTAutoComplete);

    that.getAjaxParams = function(){
        return {
            url: contextPath + "/rest/api/1.0/users/picker",
            data: {
                fieldName: options.fieldID
            },
            dataType: "json",
            type: "GET"
        };
    };

    /**
     * Create html elements from JSON object
     * @method renderSuggestions
     * @param {Object} response - JSON object
     * @returns {Array} Multidimensional array, one column being the html element and the other being its
     * corresponding complete value.
     */
    that.renderSuggestions = function(response) {


        var resultsContainer, suggestionNodes = [];

        // remove previous results
        this.clearResponseContainer();


        var deleted = 0;
        if (response && response.users && response.users.length > 0) {

            resultsContainer = jQuery("<ul/>").appendTo(this.responseContainer);

            jQuery(response.users).each(function() {
                var objText = jQuery(this.html).html();
                objText = objText.replace("<b>", "");
                objText = objText.replace("</b>", "");
                objText = objText.replace("\"", "");
                objText = objText.toUpperCase().trim();
                if (objText.indexOf("DELETED") === 0) {
                    deleted = deleted + 1;
                } else {
                    // add html element and corresponding complete value  to sugestionNodes Array
                    suggestionNodes.push([jQuery("<li/>")
                    .html(this.html)
                    .appendTo(resultsContainer), this.name]);
                }
            });
        }

        if (response.footer) {
            var footer = response.footer;
            var inparms = footer.split(" ");
            var outparms = new Array(inparms.length);
            AJS.$.each(inparms, function(i, val){
                var parsedVal = parseInt(val);
                if (!isNaN(parsedVal)) {
                    outparms[i] = inparms[i] - deleted;
                } else {
                    outparms[i] = inparms[i];
                }
            });
            footer = outparms.join(" ");

            this.responseContainer.append(jQuery("<div/>")
            .addClass("yui-ac-ft")
            .html(footer)
            .css("display","block"));
        }

        if (suggestionNodes.length > 0) {
            that.addSuggestionControls(suggestionNodes);
            AJS.$('.atlassian-autocomplete div.yad, .atlassian-autocomplete .labels li').textOverflow('&#x2026;',true);
        }

        return suggestionNodes;

    };

    // Use autocomplete only once the field has at least 2 characters
    options.minQueryLength = 2;

    // wait 1/4 of after someone starts typing before going to server
    options.queryDelay = 0.25;

    that.init(options);

    return that;

};

JIRA.UserAutoComplete.init = function(parent){
    AJS.$("fieldset.user-picker-params", parent).each(function(){
        var params = JIRA.parseOptionsFromFieldset(AJS.$(this)),
            field = (params.fieldId || params.fieldName),
            $container = AJS.$("#" + field + "_container");


        $container.find("a.popup-trigger").click(function(e){
            var url = contextPath,
                vWinUsers;

            e.preventDefault();

            if (!params.formName)
            {
                params.formName = $container.find("#" + field).parents("form").attr("name");
            }

            if (params.actionToOpen) {
                url = url + params.actionToOpen;
            } else {
                url = url + '/secure/popups/UserPickerBrowser.jspa';
            }
            url += '?formName=' + params.formName + '&';
            url += 'multiSelect=' + params.multiSelect + '&';
            url += 'element=' + field;

            vWinUsers = window.open(url, 'UserPicker', 'status=yes,resizable=yes,top=100,left=200,width=580,height=750,scrollbars=yes');
            vWinUsers.opener = self;
            vWinUsers.focus();
        });


        if (params.userPickerEnabled === true ){
            JIRA.UserAutoComplete({
                field: parent ? parent.find("#" + field) : null,
                fieldID: field,
                delimChar: params.multiSelect === false ? undefined : ",",
                ajaxData: {
                    fieldName: params.fieldName
                }
            });
        }
    });
};

/** Preserve legacy namespace
    @deprecated jira.widget.autocomplete.Users */
AJS.namespace("jira.widget.autocomplete.Users", null, JIRA.UserAutoComplete);

/** Remove DELETED users from "select" */
jQuery(document).ready(function () {
    var sel = jQuery("select[id='assignee']");
    if (sel) {
        var options = jQuery(sel).find('option');
        jQuery(options).each(function(index) {
            var option = options[index];
            var optionTxt = jQuery(option).html();
            optionTxt = optionTxt.replace("\"", "");
            optionTxt = jQuery.trim(optionTxt);
            if (optionTxt.indexOf("DELETED") === 0) {
                jQuery(option).remove();
            }
        });
    }
});
