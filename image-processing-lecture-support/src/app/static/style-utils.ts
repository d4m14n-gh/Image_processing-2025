/** Utility function to retrieve the value of a CSS variable from the document's body.
 * @param variable The name of the CSS variable (default is "--mat-sys-primary").
 * @returns The value of the specified CSS variable as a string.
 */
export function getVar(variable: string = "--mat-sys-primary"): string {
    const style = getComputedStyle(document.body);
    const variableValue = style.getPropertyValue(variable).trim();
    return variableValue;
}