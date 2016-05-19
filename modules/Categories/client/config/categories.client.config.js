'use strict';

// Configuring the Articles module
angular.module('categories').run(['Menus',
  function (Menus) {
    // Add the categories dropdown item
    Menus.addMenuItem('topbar', {
      title: 'Categories',
      state: 'categories',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'categories', {
      title: 'List Categories',
      state: 'categories.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'categories', {
      title: 'Create Categories',
      state: 'categories.create',
      roles: ['user']
    });
  }
]);
