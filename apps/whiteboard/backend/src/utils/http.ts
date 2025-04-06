export function pathParam(name: string) {
  return `(?<${name}>[^/]+)`;
}

export function pathRegex(...path: string[]) {
  return new RegExp(`^/${path.join("[/]")}[/]?$`);
}

export interface HttpEndpoint<TInfrastructure> {
  method: "get" | "post" | "patch" | "put" | "delete";
  path: RegExp;
  handler(
    infrastructure: TInfrastructure,
    req: Request,
    pathParams: Record<string, string>,
  ): Promise<Response>;
}
