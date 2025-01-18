class State {
    private _current: number = 0;

    get current(): number {
        return this._current;
    }

    set current(value: number) {
        this._current = value;
    }

    increment(): number {
        return this._current++;
    }
}

const StateInstance = new State();
export default StateInstance;