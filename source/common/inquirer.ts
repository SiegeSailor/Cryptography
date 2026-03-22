type InquirerLike = {
  prompt: <T = any>(questions: any) => Promise<T>;
};

let cachedInquirer: InquirerLike | null = null;

export async function getInquirer(): Promise<InquirerLike> {
  if (cachedInquirer) {
    return cachedInquirer;
  }

  const moduleNamespace = (await Function(
    'return import("inquirer")',
  )()) as any;
  cachedInquirer = (moduleNamespace.default ?? moduleNamespace) as InquirerLike;
  return cachedInquirer;
}
