import { render } from 'solid-js/web';
import 'solid-devtools';

export default function mount(App) {
    const root = document.getElementById('root');
    
    if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
        throw new Error(
            'Root element not found. Did you forget to add it to your index.html?',
        );
    }
    render(() => <App />, root);
}