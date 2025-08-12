import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {SidebarComponent} from './core/components/sidebar/sidebar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SidebarComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('financesK-front');
}
