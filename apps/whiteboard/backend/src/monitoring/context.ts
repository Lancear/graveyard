type SimpleValue = string | number | boolean | Date;
export type ContextAttributes = Record<string, SimpleValue>;
export type ContextSnapshot = Record<string, SimpleValue>;

export class Context {
  protected stack: ContextAttributes[] = [];

  public push(attributes: ContextAttributes) {
    this.stack.push(attributes);
    return this;
  }

  public pop() {
    this.stack.pop();
    return this;
  }

  public snapshot(): ContextSnapshot {
    return this.stack.length === 0
      ? undefined
      : Object.assign({}, ...this.stack);
  }
}
