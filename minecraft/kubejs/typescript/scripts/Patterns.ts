import {crystalAssembler, crystalAssemblerInput, itemTag, toItem} from "../utils";

ServerEvents.recipes(event => {
    const advanced = toItem('advanced_ae:small_adv_pattern_provider');
    const advanced_extended = toItem('advanced_ae:adv_pattern_provider');

    const cable = itemTag('#ae2:glass_cable');
    const capacityCards = toItem('ae2:capacity_card');
    const processor = toItem('extendedae:concurrent_processor');

    crystalAssembler(event, 'aerospace:crystal_assembler/advanced_pattern_provider', {
        inputItems: [
            advanced,
            capacityCards.stack(3),
            cable.stack(2),
            processor,
        ],
        output: advanced_extended,
        energy: 10000
    });

});