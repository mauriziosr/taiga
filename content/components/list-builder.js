class ListBuilder {

  static fetchEntitiesFrom(fetchEntities) {
    let list = new ListBuilder();
    list.listElementName = false;
    list.fetchEntities = fetchEntities;
    return list;
  }
  
  createItemsNamed(name) {
    this.listElementName = name;
    return this;
  }
  
  loadSelectionWith(callback) {
    this.loadSelection = callback;
    return this;
  }
  
  storeSelectionWith(callback) {
    this.storeSelection = callback;
    return this;
  }
  
  addItemsTo(list) {
    while (list.firstChild) 
      list.removeChild(list.firstChild);
      
    this.list = list;
    return this;
  }
  
  addItemOnlyWhen(filter) {
    this.filter = filter;
    return this;
  }
  
  nameEntities(entityName, entitiesName) {
    this.entityName = entityName;
    this.entitiesName = entitiesName;
    return this;
  }
  
  mapEntityToItemWith(entityItemMapper) {
    this.entityItemMapper = entityItemMapper;
    return this;
  }
  
  consumeSelectionWith(callback) {
    this.entities = {};
    
    this.list.addEventListener('select', () => {
      if (this.list.selectedItem !== null) {
        const value = this.list.selectedItem.value;
        
        if (this.storeSelection)
          this.storeSelection(value);
          
        callback(this.entities[value]);
        
      } else callback(null);
    });
    
    this.list.style.cursor = 'progress';
    this.list.setAttribute('disabled', 'true');
    
    return new Promise((resolve, reject) => { 
      this
        .fetchEntities()
        
        .then((entities) => {
          if (entities.length == 0) 
            throw new Error(i18n('noEntities', [ this.entityName ]));

          let entityItemMapping = {};
          entities.forEach((entity) => {
            if (this.filter && !this.filter(entity))
              return;

            let item = document.createElement(
              this.listElementName || 'listitem');
            
            if (this.entityItemMapper) {
              this.entityItemMapper(entity, item);
            } else {
              item.setAttribute('value', entity.id);
              item.setAttribute('label', entity.name);
            }

            this.list.appendChild(item);
            this.entities[entity.id] = entity;
            entityItemMapping[entity.id] = item;
          });

          this.list.style.cursor = 'auto';
          this.list.setAttribute('disabled', 'false');
          
          const selection = this.loadSelection();

          if (selection !== null &&
              Object.keys(entityItemMapping).includes(selection))
            this.list.selectedItem = entityItemMapping[selection];
          
          resolve();
        })
        
        .catch((error) => {
          console.log(error); 
          
          if (typeof(error) !== 'string') {
  					error = Extension
              .i18n('errorGettingEntities', [ this.entitiesName ]);
  				}

          this.list.style.cursor = 'auto';
          this.list.setAttribute('disabled', 'false');
          
          reject(error);
        });
    });
  }

}