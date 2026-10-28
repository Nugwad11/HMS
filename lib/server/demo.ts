export function demoEmailCodesVisible(): boolean {
  return process.env.COVENANT_DEMO_MODE !== "false";
}
