class Vars {
    private vars: { [key: string]: any } = {};

    public addVar(name: string, value: any): void {
        this.vars[name] = value;
    }

    public getVar(name: string): any {
        return this.vars[name];
    }

    public removeVar(name: string): void {
        delete this.vars[name];
    }

    public hasVar(name: string): boolean {
        return this.vars[name] !== undefined;
    }

    public getVars(): Record<string, any> {
        return { ...this.vars };
    }

    public setVars(newVars: Record<string, any>) {
        this.vars = { ...newVars };
    }

}

const VarsInstance = new Vars();
export default VarsInstance;