// Example Component for Dynamic Loading
class ExampleComponent {
    constructor(element) {
        this.element = element;
        this.init();
    }

    init() {
        this.render();
    }

    render() {
        this.element.innerHTML = `
            <div class="dynamic-component">
                <h3>Dynamically Loaded Component</h3>
                <p>This component was loaded on demand.</p>
            </div>
        `;
    }
}

export default ExampleComponent;