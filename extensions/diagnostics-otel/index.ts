import type { iFlowPluginApi } from "iflow/plugin-sdk";
import { emptyPluginConfigSchema } from "iflow/plugin-sdk";
import { createDiagnosticsOtelService } from "./src/service.js";

const plugin = {
  id: "diagnostics-otel",
  name: "Diagnostics OpenTelemetry",
  description: "Export diagnostics events to OpenTelemetry",
  configSchema: emptyPluginConfigSchema(),
  register(api: iFlowPluginApi) {
    api.registerService(createDiagnosticsOtelService());
  },
};

export default plugin;
