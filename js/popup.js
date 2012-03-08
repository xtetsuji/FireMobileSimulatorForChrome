/* ***** BEGIN LICENSE BLOCK Version: GPL 3.0 ***** 
 * FireMobileFimulator is a Firefox add-on that simulate web browsers of 
 * japanese mobile phones.
 * Copyright (C) 2008  Takahiro Horikawa <horikawa.takahiro@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * ***** END LICENSE BLOCK ***** */

var firemobilesimulator;
if (!firemobilesimulator) firemobilesimulator = {};
var fms;
if (!fms) fms = firemobilesimulator;
if (!fms.overlay) fms.overlay = {};

/**
 * 端末選択のポップアップメニューを選択したときのイベントハンドラ
 */
fms.overlay.displayDeviceSwitcherMenu = function(menu, suffix) {
  var optionsSeparator = menu.find("#separator2");
  console.log(optionsSeparator);

  this.removeGeneratedMenuItems(menu, ["msim-default-" + suffix,
          "msim-options-" + suffix, "msim-devicedb-" + suffix, "msim-about-" + suffix]);

  var deviceCount = fms.common.pref.getPref("msim.devicelist.count");
  console.log("get [" + deviceCount + "] devices");
  for (var i = 1; i <= deviceCount; i++) {
    var device = fms.common.pref.getPref("msim.devicelist." + i + ".label");
    if (!device) continue;

    var carrier = fms.common.pref.getPref("msim.devicelist." + i + ".carrier");
    var useragent = fms.common.pref.getPref("msim.devicelist." + i + ".useragent");

    var menuItem = $("<li>")
    .text(carrier + " " + device)
    .attr("id", "msim-device-" + suffix + "-" + i)
    .click({id:i}, function (e) {
        fms.core.setDevice(e.data.id);
    });
    console.log(menuItem);
    menuItem.insertBefore(optionsSeparator);
  }
  
  // 現在選択されている端末にチェックをつける
  var currentId;
  var tabselect_enabled = fms.common.pref.getPref("msim.config.tabselect.enabled");
  if (tabselect_enabled) {
    // TODO tab specific setting
  } else {
    currentId = fms.common.pref.getPref("msim.current.id");
  }

  var currentMenu;  
  if (currentId) {
    currentMenu = menu.find("#msim-device-" + suffix + "-" + currentId);
  }
  if (!currentMenu) {
    currentMenu = menu.find("#device-default");
    console.log(currentMenu);
  }  
  currentMenu.addClass("selected");

};

/**
 * 端末選択メニューのDOMをXUL上から削除する
 */
fms.overlay.removeGeneratedMenuItems = function(menu,
    permanentMenus) {
  var menuItem = null;

  // radioMenuItems = menu.getElementsByAttribute("type", "radio");
  var menuItems = menu.find("menuitem");

  while (menuItems.length > permanentMenus.length) {
    menuItem = menuItems[3]; //注意メニューの構造が変わったら変える

    if (!menuItem.hasAttribute("id")) {
      menu.removeChild(menuItem);
    } else {
      var deleteFlag = true;
      for (var i = 0; i < permanentMenus.length; i++) {
        if (menuItem.getAttribute("id") == permanentMenus[i]) {
          deleteFlag = false
        }
      }
      deleteFlag && menu.removeChild(menuItem);
    }
  }

};

fms.overlay.openOptions = function() {
  window.openDialog("chrome://msim/content/options/options.xul",
      "msim-options-dialog", "centerscreen,chrome,modal,resizable");
};

fms.overlay.openDeviceDB = function() {
  window.getBrowser().selectedTab = window.getBrowser().addTab("chrome://msim/content/html/device_add.html");
};

fms.overlay.openAbout = function() {
  window.openDialog("chrome://msim/content/about.xul", "msim-about-dialog",
      "centerscreen,chrome,modal,resizable");
};

/**
 * タブごとの再描画
 */
fms.overlay.rewrite = function () {
  	("[msim]rewrite tab\n");
  var statusPanel = document.getElementById("msim-status-panel");
  var tabselect_enabled = fms.common.pref.getPref("msim.config.tabselect.enabled");
  if (!tabselect_enabled) {
    // タブごとに端末選択モードでない場合は、下部ステータスバーの端末選択メニューを非表示にする
    
    console.log("[msim]tabselect is not enabled\n");
    statusPanel.setAttribute("style","visibility: collapse");
    return;
  }
  
  statusPanel.setAttribute("style","visibility: visible");
  var tab = gBrowser.selectedTab;
  var ss = Components.classes["@mozilla.org/browser/sessionstore;1"].getService(Components.interfaces.nsISessionStore);
  var id = ss.getTabValue(tab, "firemobilesimulator-device-id");
  var pref_prefix = "msim.devicelist." + id;
  var carrier = fms.common.pref.getPref(pref_prefix + ".carrier");
  var name = fms.common.pref.getPref(pref_prefix + ".label");

  var statusImage = document.getElementById("msim-status-image");
  var statusLabel = document.getElementById("msim-status-label");
  var msimButton = document.getElementById("msim-button");
  var menu = document.getElementById("msim-menu");
  var target = [msimButton, menu];

  if (id) {
    target.forEach(function(item) {
      if (item) {
        item.setAttribute("device", "on");
      }
    });
    statusImage.setAttribute("device", "on");
  } else {
    target.forEach(function(item) {
      if (item) {
        item.removeAttribute("device");
      }
    });
    statusImage.removeAttribute("device");
  }
  statusLabel.setAttribute("value", name);
};