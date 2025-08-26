export function getVar(variable: string = "--mat-sys-primary"): string {
    const style = getComputedStyle(document.body);
    const variableValue = style.getPropertyValue(variable).trim();
    return variableValue;
}