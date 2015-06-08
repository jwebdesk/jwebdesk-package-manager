define([
    "jwebkit",
    "jwebdesk",
], function(jwk, jwebdesk) {

/*
if (window.top == window) {
    jwebdesk.init();
}

*/

    var packManager;
    var data;

    var selected_package_layout = ["header", ["left", "|%", ["list_panel", "|", "package_panel"]],"footer"];
    var no_package_layout = ["header", ["left", "|%", ["list_panel", "|", "no_package_panel"]],"footer"];
    var default_icon = jwebdesk.rawURL + "/jwebdesk/jwebdesk-package-manager/alpha-0.5/application_default_icon.png";
    
    // jwebdesk --------------------------------------------------------------------------
    jwebdesk.PackManager = function (settings) {
        if (!settings) return;
        
        var table = this;
        var def = {
            "class": "expand",
            "ui_type": "jwebdesk-packManager",
            "namespace": "jwebdesk"
        };

        settings = jwk.extend(def, settings);
        jwebdesk.App.call(this, settings);
        // -------------------------------
        // HACK: para separar el jwk del jwk.ui
        var c = new jwk.ui.Component();
        for (var i in c) {
            if (typeof c[i] == "function" && typeof this[i] == "undefined") {
                this[i] = c[i];                
            }
        }
        jwk.ui.Component.call(this, settings);
        // -------------------------------        
        document.body.removeAttribute("loading");
        
        console.assert(this.proxy);
    
        this.proxy.on("command", function (n,e){
            // app.container().target.append($("<span>").text("Submenu Command: ", e.command));
            console.log("Submenu Command: ", e.command);
        });
        
        data = new jwk.Object();
        data.set("search", "");
                                    
        data.set("packages.labels", ["Owner", "Name", "Version", "Type", "Codetype", "Brief", "Date"], {deep: true});
        data.set("packages.fields", ["owner", "name", "version", "type", "codetype", "brief", "date"], {deep: true});
        data.set("packages.rows", [], {deep: true});
        
        data.set("package.visible", false, {deep: true});
        data.set("main_layout", no_package_layout);
        
        
        jwebdesk.wait_service("user-auth").then(function (user) {
            // console.error("aaaaaaaaaaaaaaaaaa", [user]);
            return user.logged();
        }).then(function (is_logged, user) {
            // console.error("aaaaaaaaaaaaaaaaaa", [user]);
            if (is_logged) return user;
            return {id: 0};
        }).then(function (user) {
            // console.error("aaaaaaaaaaaaaaaaaa", [user]);
            jwebdesk.repository.list(/*{
                "left": {"prop":"state", "equals":"prod"},
                "op": "or",
                "right": {"prop":"publisher","equals":user.id}
            }*/).done(function (lista) {
                var _packages = [];

                for (package_path in lista) {
                    package_json = lista[package_path];
                    try {
                        if (typeof package_json == "string") {
                            package_json = JSON.parse(package_json);
                            console.error("ESTO SE USA????");
                        }
                    } catch (err) {
                        console.error("ERROR: trying to parse JSON: ", err.message, [package_json]);
                    }
                    package_json.path = package_path;
                    _packages.push(package_json);
                }

                console.log("data.packages.rows", [_packages]);
                data.set("packages.rows", _packages, {deep: true});
                
            });        
        });
    }
    
    jwebdesk.PackManager.prototype = new jwebdesk.App();
    jwebdesk.PackManager.prototype.constructor = jwebdesk.PackManager;
    
    
    var start_pkg_config_node = "/config/vapaee/jwebdesk/alpha-0.5";
    jwebdesk.PackManager.prototype.install = function (package) {
        return jwebdesk.wait_service("package-manager").done(function(manager) {
            manager.install(package);
        });
    }

    jwebdesk.PackManager.prototype.uninstall = function (package) {
        return jwebdesk.wait_service("package-manager").done(function(manager) {
            manager.uninstall(package);
        });
    }
    
    jwebdesk.PackManager.prototype.structure_tree = function () {
        var manager = this;
        
        this.on("change:structure", function (n, e) {
            var structure = e.value;
            
            structure.search("pack_list").on("selection", function (n,e) {                
                var obj = data.packages.rows[e.index];                
                obj.icon = obj.icon || default_icon;
                data.set("selected", new jwk.Object(obj));
            }); 
            
            /*
            structure.search("btn_open_app").on("click", function (n,e) {
                jwebdesk.open_app(data.get("package.path"));
            });
            structure.search("btn_install").on("click", function (n,e) {
                manager.install(data.get("selected").valueOf().path).done(function () {
                    data.set("package.installed",     true);
                    data.set("package.not_installed", false);
                });
            });
            structure.search("btn_uninstall").on("click", function (n,e) {
                manager.uninstall(data.get("selected").valueOf().path).done(function () {
                    data.set("package.installed",     false);
                    data.set("package.not_installed", true);
                });
            });
            structure.search("btn_clone_package").on("click", function (n,e) {
            });

            */
            
            structure.search("btn_create").on("click", function (n,e) {
                jwebdesk.open_app("jwebdesk-package-wizard");
            });
        });
        
        
        return {
            "data": data,
            "disable_selection": true,
            "class": "expand b3",
            "name": "structure",
            "ui_type": "panel.inset",
            "namespace": "jwk-ui",
            "children": {
                "main_layout": {
                    "start": "col",
                    "layout": ["header", ["left", "|", ["list_panel", "|", "package_panel"]],"footer"],
                    "ui_type": "panel.layout",
                    "class": "expand",
                    "children": {
                        "header": {
                            "class": "expand",
                            "ui_type": "panel",
                            "children": {
                                "btn_refresh": {
                                    "ui_type": "button",
                                    "text": "Refresh"
                                }, 
                                "big_title": {
                                    "ui_type": "label",
                                    "text": "Fast Filter"
                                }, 
                                "input_search": {
                                    "ui_type": "input",
                                    "datapath": "search"
                                }, 
                                "btn_search": {
                                    "ui_type": "button",
                                    "text": "Search"
                                }, 
                                "btn_create": {
                                    "ui_type": "button",
                                    "text": "Create Package"
                                }
                            }
                        },
                        "left": {
                            "class": "expand",
                            "ui_type": "panel.inset",
                            "children": {
                                "btn_1": {
                                    "ui_type": "button",
                                    "text": "Useless button"
                                },
                                "btn_2": {
                                    "ui_type": "button",
                                    "text": "harmless"
                                },
                                "btn_3": {
                                    "ui_type": "button",
                                    "text": "Don't press this one"
                                }
                            }
                        },
                        "list_panel": {
                            "class": "expand",
                            "ui_type": "panel.inset",
                            "children": {
                                "pack_list": {
                                    "ui_type": "table",
                                    "class": "expand",
                                    "labels": "<<data.packages.labels>>",
                                    "fields": "<<data.packages.fields>>",
                                    "value": "<<data.packages.rows>>"
                                }
                            }
                        },
                        "no_package_panel": {
                            "class": "expand",
                            "ui_type": "panel.inset"                            
                        },
                        "package_panel": {
                            "class": "expand",
                            "ui_type": "panel.inset",
                            "children": {
                                "p_scroll": {
                                    "style": "top: 5px; left: 5px; right: 5px; bottom: 5px; position: absolute",
                                    "ui_type": "panel.scroll",
                                    
                                    "children": {
                                        "package_view": {
                                            "class": "jwk-ui expand",
                                            "ui_type": "package.view",
                                            "namespace": "jwebdesk",
                                            "value": "<<data.selected>>"
                                        }
                                    }
                                }
                                
                                
                                
                            }
                        },
                        "footer": {
                            "class": "expand",
                            "ui_type": "panel",
                        }
                    }
                }
            }
        };

    }
    
    jwebdesk.PackManager.prototype.parent_for = function (name, index) {
        switch (name) {
            case "structure":
                return {parent:this};
        }
        return {parent:this.get("structure"), query:".content"};
    }
    
    jwk.ui.component({
        ui_type: "jwebdesk-packmanager",
        namespace: "jwebdesk",
        constructor: jwebdesk.PackManager
    });    
    
    packManager = jwk.ui.display_component({
        "ui_type": "jwebdesk-packmanager",
        "namespace": "jwebdesk"
    });

    return packManager.get("main");

});