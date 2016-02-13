
                var edittable_core = function(){
                    var self = this;
                    self.element = "";
                }

                edittable_core.prototype.create_line_menu = function(line_element){
                    var master = this;

                    var line_tag = $("<td class='line_action_menu'>");
                        var select_action_menu = $("<select>");
                        $(select_action_menu).append("<option data-action='edit'>Edit</option>");
                        $(select_action_menu).append("<option data-action='delete'>Delete</option>");
                        $(select_action_menu).append("<option data-action='party'>Party</option>");
                        $(select_action_menu).appendTo(line_tag);

                        var action_button = $("<button>");
                        $(action_button).text("Ausführen");
                        $(action_button).appendTo(line_tag);

                    $(line_tag).appendTo(line_element);


                    $(action_button).bind("click", function(){
                        var self = this;
                        var selected_option = $(self).parent("td").find("select option:selected" ).attr("data-action");

                        switch(selected_option){

                            case "edit":
                                var td_count = $(line_element).find("td").length;
                                $(line_element).find("td:nth-child(-n+"+(td_count-1)+")").each(function(key, col_elem){
                                    var content = $(col_elem).html();
                                    $(col_elem).html("<input type='text' value='"+content+"'>");
                                });

                                $(action_button).unbind("click");

                                $(line_element).find("td").last().find("*").unbind().remove();

                                var save_button = $("<button>");
                                $(save_button).text("Save");

                                $(save_button).appendTo($(line_element).find("td").last());

                                $(save_button).bind("click", function() {

                                    var self = $(this);
                                    master.save_line(self);
                                });
                                //$(line_element)

                            break;

                            case "delete":
                                var line_data = {};
                                line_data["action"] = "delete";
                                line_data["db_id"] = $(line_element).attr("data-db_id");

                                $(line_element).find("td").last().find("*").unbind().remove();

                                var exec_button = $("<button>");
                                $(exec_button).html("<i class='fa fa-spinner fa-spin'></i>");
                                $(exec_button).appendTo($(line_element).find("td").last());

                                try{
                                    master.kwargs["ondelete"](line_data, self, exec_button);
                                }catch(e){
                                    console.error(e);
                                }

                                $(line_element).remove();

                            break;

                            case "party":
                                var counter = 0;
                                var interval = window.setInterval(function(){
                                    var max_td = $(line_element).find("td").length;
                                    var random_td = getRandomInt(0, max_td);
                                    var td_elem = $(line_element).find("td")[random_td];
                                    var r = getRandomInt(0,255);
                                    var g = getRandomInt(0,255);
                                    var b = getRandomInt(0,255);
                                    $(td_elem).css({"background-color":"rgb("+r+","+g+","+b+")"});
                                    if (counter >= 100){
                                        window.clearInterval(interval);
                                    }
                                    counter++;
                                }, 250);
                            break;

                        }
                    });
                }

                edittable_core.prototype.save_line = function(elem){
                    var self = this;
                    var line_data = {};

                    var td_count = $(elem).parent("td").parent("tr").find("td").length;
                    $(elem).parent("td").parent("tr").find("td:nth-child(-n+"+(td_count-1)+")").each(function(key, col_elem){
                        var content = $(col_elem).find("input").val();
                        var headline = self.get_headline(key);
                        line_data[headline] = content;
                        $(col_elem).html(content);
                    });
                    line_data["db_id"] = $(elem).parent("td").parent("tr").attr("data-db_id");
                    line_data["action"] = "save";

                    $(elem).unbind("click");
                    $(elem).html("<i class='fa fa-spinner fa-spin'></i>");

                    try{
                        self.kwargs["onedit"](line_data, self, elem);
                    }catch(e){
                        console.error(e);
                    }
                }

                edittable_core.prototype.stop_spinner = function(elem){
                    var self = this;
                    var line_element = $(elem).parent("td").parent("tr");
                    $(line_element).find("td").last().remove();
                    self.create_line_menu(line_element);
                };

                edittable_core.prototype.get_headline = function(key){
                    var self = this;
                    return $(self.element).find("tr").find("th:nth-child("+(key+1)+")").html().toLowerCase();
                }


                var edittable_list;
                edittable_list = [];


                jQuery.fn.extend({
                    edittable: function (kwargs) {
                        var self = $(this);
                        var exist_an_element = get_existing_edittable(self);

                        var col_headline = "Action";
                        if ("col_headline" in kwargs){
                            var col_headline = kwargs["col_headline"];
                        }


                        if(!exist_an_element){
                            var core_obj = new edittable_core();
                            core_obj.element = self;;
                            core_obj.kwargs = kwargs;

                            //Create Headline
                            var new_action_col = $("<th>");
                            $(new_action_col).html(col_headline);
                            $(new_action_col).appendTo($(self).find("tr")[0])


                            //Line Edit Menü

                            $(self).find("tr:nth-child(n+2)").each(function(key, line_element){
                                core_obj.create_line_menu(line_element);
                            });
                            edittable_list.push(core_obj);
                        }
                    }
                });





                function get_existing_edittable(element){
                    var result = false;
                    $.each(edittable_list, function(key, value){
                        if(value.element == element){
                            result = element;
                        }
                    });
                    return result;

                }
                function getRandomInt(min, max) {
                  return Math.floor(Math.random() * (max - min)) + min;
                }
