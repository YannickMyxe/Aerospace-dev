import { Fluid as FluidRegistryEvent } from "@side-only/startup/events/registry";

type SimpleFluidBuilder = ReturnType<FluidRegistryEvent["create"]>;
type FluidTint = Parameters<SimpleFluidBuilder["tint"]>[0];

export const simpleFluid = (
    event: FluidRegistryEvent,
    name: string,
    tint: FluidTint
): SimpleFluidBuilder => {
    return event.create(name)
        .stillTexture(`kubejs:block/${name}_still`)
        .flowingTexture(`kubejs:block/${name}_flow`)
        .tint(tint)
        .displayName("Custom Fluid");
};

