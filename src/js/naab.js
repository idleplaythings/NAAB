NAAB = {};

/**
 * Version tag. Filled in as a build step of the extenion.
 */
NAAB.version = 'v0.0.0';

/**
 * Add a small NAAB branding to the army buidler page
 *
 * This serves two purposes:
 *  - to indicate that the extension is active and has loaded
 *  - to prominently display the version of the currently installed extension
 */
NAAB.renderFooter = function() {
  var naabFooter = new Element('div', {
    id: 'naabFooter'
  });
  var naabLink = new Element('a', {
    href: 'https://github.com/idleplaythings/NAAB',
    text: 'NAAB ' + this.version,
    target: '_blank'
  });
  naabLink.inject(naabFooter);
  naabFooter.inject(document.body);
};

/**
 * Initialises NAAB by overwriting ARMY 5 functions, hooking into ARMY 5 events etc.
 */
NAAB.init = function() {
  NAAB.renderFooter();
  NAAB.hookIntoArmy5();

  console.log('NAAB initialised');
};

/**
 * Reference to the currently selected unit element in the army list
 */
NAAB.selectedArmyListUnit = null;

/**
 * Select a unit from the army list. Rather than just displaying the profile of the selected
 * unit type, NAAB holds a reference to the selected unit and allows you to change the
 * profile of the unit.
 */
NAAB.selectUnit = function(element) {
  this.selectedArmyListUnit = element;
  element.addClass('selected');
};

/**
 * Deselects the (potentially) selected army list unit by dropping the reference to the
 * selected element and removing any associated clases from the DOM.
 */
NAAB.deselectUnit = function() {
  this.selectedArmyListUnit = null;
  $$('#contenedorLista .e_contenedor.selected').removeClass('selected');
};

/**
 * Selects the profile matching to the provided army list element, if applicable. All unit
 * types don't necessarily have selectable profiles (think spec ops units as an example).
 */
NAAB.selectProfileByArmyListUnit = function(armyListElement) {
  var profileId = armyListElement.getAttribute('id').split('_')[2];
  var profileElement = $('opcion_1_' + profileId);

  // There aren't necessarily any selectable profiles for the unit
  if (profileElement) {
    profileElement.addClass('selected');
  }
};

/**
 * Deselects any potentially selected profiles. There's no need to store references to the
 * selected profiles, so this will just remove any applicable classes from DOM elements.
 */
NAAB.deselectProfile = function() {
  $$('.linea_opcion.selected').removeClass('selected');
};

/**
 * This "event handler" is triggered when a unit in the army list is clicked.
 *
 * The handler finds the top level container element for the unit, and stores a reference to
 * it to make it possible to change the profile of that unit without having to first remove it.
 *
 * This is pretty straight forward for most units, but there are units that introduce
 * interesting edge cases. For example, ALEPH's Atalanta comes with a Spotbot that is rendered
 * as a separate unit within Atalanta herself.
 */
NAAB.onUnitSelected = function(originalFn, id, IDArmy) {
  // Grab event from the global event object, since it's not passed to the handler
  var target = event.target;
  var armyListUnit;

  if (target.hasClass('e_contenedor') && target.get('idarmy')) {
    armyListUnit = target;
  } else {
    armyListUnit = target.getParents('[idarmy]')[0];
  }

  NAAB.deselectUnit();
  NAAB.deselectProfile();
  NAAB.selectUnit(armyListUnit);

  originalFn(id, IDArmy);

  NAAB.deselectProfile();
  NAAB.selectProfileByArmyListUnit(armyListUnit);
};

/**
 * This event handler is triggered when the main menu (the faction/army selection menu) is rendered.
 *
 * NAAB hooks to this event to clean up after itself by hiding the unit list and clearing any selected
 * units/profiles.
 */
NAAB.onMainMenu = function(originalFn) {
  $('naabUnitPanel').dispose();
  NAAB.deselectUnit();
  NAAB.deselectProfile();
  originalFn();
};

/**
 * This event handler is triggered when a unit profile is clicked to add said profile to the army list.
 *
 * NAAB hooks to this event to handle the special case of adding a profile to the army list while having
 * an existing profile in the army list selected. In this case NAAB will replace the selected profile with
 * the new one, to make it possible to switch profiles in the army list, rather than having to first remove
 * the old ones and adding the new ones to the end of list.
 */
NAAB.onProfileAddedToArmyList = function(originalFn, data) {
  originalFn(data);

  if (NAAB.selectedArmyListUnit) {
    // Find the last unit in the army list. These searches are limited to immediate children, because some
    // units may contain nested units.
    var addedElement = $$('#contenedorLista > .e_contenedor')[$$('#contenedorLista > .e_contenedor').length - 1];

    // Mark the last unit as selected, and...
    addedElement.addClass('selected');
    // inject it right after the currently selected unit
    addedElement.inject(NAAB.selectedArmyListUnit, 'after');

    // Remove the currently selected element
    borraLinea(NAAB.selectedArmyListUnit.getAttribute('id'));

    NAAB.deselectProfile();
    NAAB.selectUnit(addedElement);
    NAAB.selectProfileByArmyListUnit(addedElement);

    // ARMY5 internal stuff... does whatever it does
    ponParImpar();
    checkGrupos();
    gestionaOrdenesGrupos();
  } else {
    NAAB.deselectUnit();
    NAAB.deselectProfile();
  }
};

/**
 * This event handler is triggered when the list of units for the selected army/sectorial is rendered.
 *
 * This is one of the most heavily customised features of NAAB.
 *
 * The default unit list rendering is suppressed entirely and the unit list is forced to vertical mode
 * to ensure that other UI elements are positioned correctly. The given units are rendered in an
 * alphabetical order, and the unit type (LI, MI, HI, TAG, etc...) information is rendered in to the
 * unit element.
 *
 * ARMY5 will trigger this event every time new set of units is requested from the server. This happens,
 * for example, when the filtering settings are changed.
 */
NAAB.onUnitListRendered = function(originalFn, data) {
  // Set unit list to vertical mode
  ponMenuLogos(false);

  var existingUnitPanel = $('naabUnitPanel');

  if (existingUnitPanel) {
    existingUnitPanel.dispose();
  }

  var defaultUnitPanel = $('panelLogos');

  // Render NAAB unit panel on top of the regular one
  var naabUnitPanel = new Element('div', { id: 'naabUnitPanel' });
  document.body.appendChild(naabUnitPanel);

  var dataHTML = data.substr(data.indexOf('|') + 1);
  var dataDOM = Elements.from(dataHTML);

  var currentUnitType = '';

  dataDOM.map(function(element, index) {
    // Even though not visible in the ARMY5 default UI, the HTML returned from the server
    // contains "nombreTipo" elements that indicate the unit's type (LI, MI, HI, TAG, etc...)
    // We keep track of the current unit type to add that as an additional element inside the
    // unit's div.
    if (element.hasClass('nombreTipo')) {
      currentUnitType = element.getElement('.rotulo').get('text');
      return null;
    }

    if (element.hasClass('logo_unidad')) {
      // If a unit type element has been encountered, add a unit type element inside the units
      // element to be rendered as a helpful UI feature. This is done conditionally since not
      // every unit has a type (e.g. ALEPH's Netrods)
      if (currentUnitType) {
        var unitTypeElement = new Element('div', { class: 'unitType '});
        unitTypeElement.set('text', currentUnitType);
        element.appendChild(unitTypeElement);
      }

      element.addEvent('click', function() {
        NAAB.deselectUnit();
        NAAB.deselectProfile();
        cargaDatosLogo(this.id);
      });

      return element;
    }
  }).filter(function(element) {
    // Unit type elements were mapepd to null in the previous step, and are now removed
    // from the array
    return element;
  }).sort(function(a, b) {
    // Sort units alphabetically by their name
    var aText = a.getElement('.isc').get('text');
    var bText = b.getElement('.isc').get('text');
    return aText.localeCompare(bText);
  }).each(function(element) {
    naabUnitPanel.appendChild(element);
  });
};

/**
 * Hook NAAB into ARMY5's functions by simply overwriting the functions from the global
 * execution context. Reference to the old functions is stored as it is needed in some cases.
 */
NAAB.hookIntoArmy5 = function() {
  // Render the main menu
  var _irMenuPrincipal = irMenuPrincipal;
  irMenuPrincipal = function() {
    NAAB.onMainMenu(_irMenuPrincipal);
  };

  // Render the unit list
  var _cargaInfoLogos = cargaInfoLogos;
  cargaInfoLogos = function(data) {
    NAAB.onUnitListRendered(_cargaInfoLogos, data);
  };

  // Add profile to the army list
  var _insertaOpcionLista = insertaOpcionLista;
  insertaOpcionLista = function(profileData) {
    NAAB.onProfileAddedToArmyList(_insertaOpcionLista, profileData);
  };

  // Select unit from unit list
  var _cargaDatosCache = cargaDatosCache;
  cargaDatosCache = function(id, IDArmy) {
    NAAB.onUnitSelected(_cargaDatosCache, id, IDArmy);
  };

  var fixUnitDragCompleteHandler = function(attempts) {
    if (attempts === 0) {
      console.log('Unable to patch unit drag complete handler');
      return;
    }

    if (typeof listado_elementos === 'undefined') {
      console.log('Waiting for listado_elementos element to appear');
      setTimeout(fixUnitDragCompleteHandler.bind(null, attempts-1), 200);
      return;
    }

    // Override army list drag on complete handler to fix the bug where by the
    // yellow highlight color sticks with the dragged unit.
    listado_elementos.$events.complete = [function(e) {
      dragging = false;

      // This is the actual fix: remove "seleccionado" class from every army list
      // element when the drag is complete
      $$(".elementoLista").each(function(e) {
        e.removeClass("seleccionado");
      });

      // ARMY5 stuff...
      ponParImpar();
      checkGrupos();
      gestionaOrdenesGrupos();
    }];
  };

  fixUnitDragCompleteHandler(10);

  // Deselect the selected unit if a click event reaches the main container
  $('contenedorFondos').addEvent('click', function() {
    NAAB.deselectProfile();
    NAAB.deselectUnit();
  });
};
