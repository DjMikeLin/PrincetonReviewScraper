let Champ = require('../models/champ');

Champ.find().then(champs => {
    champs.forEach(champ => {
        champ.startingAbilities.forEach(ability => {
            if(!abilitySet.has(ability.id)){
                uniqueAbilities.push(ability);
                abilitySet.add(ability.id);
            }
        });
        
        champ.abilitySets.forEach(e => {
            e.forEach(ele => {
                ele.abilities.forEach(ability => {
                    if(!abilitySet.has(ability.id)){
                        uniqueAbilities.push(ability);
                        abilitySet.add(ability.id);
                    }
                })
            })
        })

        champ.classes.forEach(element => {
            if(!classSet.has(element)){
                uniqueClasses.push({ name: element });
                classSet.add(element);
            }
        });

        champ.races.forEach(element =>{
            if(!raceSet.has(element)){
                uniqueRaces.push({ name: element });
                raceSet.add(element);
            }
        });
    });
    Ability.create(uniqueAbilities).then(() => {
        Race.create(uniqueRaces).then(() => {
            Class.create(uniqueClasses).then(() =>{
                console.log("Finished Creating and Seeding!");
            });
        });
    });
});
