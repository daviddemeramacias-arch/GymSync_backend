declare module 'node-cron' {
  export function schedule(expression: string, task: () => void, options?: any): any;
  export function validate(expression: string): boolean;
  const cron: {
    schedule: typeof schedule;
    validate: typeof validate;
  };
  export default cron;
}
