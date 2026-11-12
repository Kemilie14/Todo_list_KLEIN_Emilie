// frontend/src/app/todo-list/todo-list.component.ts
import { Component, inject, computed, input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TodoService, Todo } from '../todo.service';
import { EditableDirective } from '../editable.directive';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [FormsModule, RouterLink, EditableDirective],
  template: `
    <main class="page">
      <section class="card">
        <!-- En-tête -->
        <header class="card-header">
          <div>
            <p class="subtitle">Organise ta journée</p>
            <h1>Mes tâches</h1>
          </div>
          <span class="counter">{{ remaining() }} à faire</span>
        </header>

        <!-- Input de création -->
        <div class="add-todo">
          <span class="plus">+</span>
          <input
            type="text"
            [(ngModel)]="newTodoText"
            (keydown.enter)="add()"
            placeholder="Ajouter une tâche puis Entrée"
          />
        </div>

        <!-- Filtres via Routing (boutons) -->
        <div class="filters">
          <button
            type="button"
            routerLink="/"
            [queryParams]="{ statut: 'all' }"
            [class.active]="filter() === 'all'"
          >
            Toutes
          </button>
          <button
            type="button"
            routerLink="/"
            [queryParams]="{ statut: 'in-progress' }"
            [class.active]="filter() === 'in-progress'"
          >
            En cours
          </button>
          <button
            type="button"
            routerLink="/"
            [queryParams]="{ statut: 'done' }"
            [class.active]="filter() === 'done'"
          >
            Terminées
          </button>
        </div>

        <!-- Liste avec Control Flow -->
        <ul class="list">
          @for (todo of filteredTodos(); track todo.id) {
            <li [class.is-done]="todo.status === 'done'">
              <input
                type="checkbox"
                class="check"
                [checked]="todo.status === 'done'"
                (change)="toggleStatus(todo)"
              />

              <!-- Directive appEditable sur la Div -->
              <div
                class="todo-text"
                appEditable
                (editComplete)="updateText(todo.id, $event)"
                title="Double-cliquez pour éditer"
              >
                {{ todo.text }}
              </div>

              <button type="button" (click)="delete(todo.id)" class="btn-delete" title="Supprimer">
                Supprimer
              </button>
            </li>
          } @empty {
            <li class="empty">Rien par ici pour le moment.</li>
          }
        </ul>

        <footer class="hint">Astuce : double-clique sur une tâche pour la modifier.</footer>
      </section>
    </main>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
        background: #0f172a;
        font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        color: #e2e8f0;
      }
      .page {
        display: flex;
        justify-content: center;
        padding: 3rem 1rem;
      }
      .card {
        width: 100%;
        max-width: 520px;
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 16px;
        box-shadow: 0 20px 45px rgba(0, 0, 0, 0.4);
        overflow: hidden;
      }

      /* En-tête */
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        padding: 1.75rem 1.75rem 1.5rem;
        border-bottom: 1px solid #334155;
      }
      .subtitle {
        margin: 0;
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: #2dd4bf;
      }
      h1 {
        margin: 0.25rem 0 0;
        font-size: 1.9rem;
        font-weight: 700;
        color: #f8fafc;
      }
      .counter {
        background: rgba(45, 212, 191, 0.15);
        color: #5eead4;
        padding: 0.35rem 0.8rem;
        border-radius: 999px;
        font-size: 0.85rem;
        font-weight: 600;
        white-space: nowrap;
      }

      /* Ajout */
      .add-todo {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        margin: 1.25rem 1.75rem 0;
        padding: 0.2rem 0.9rem;
        background: #0f172a;
        border: 2px solid #334155;
        border-radius: 10px;
        transition: border-color 0.2s;
      }
      .add-todo:focus-within {
        border-color: #14b8a6;
      }
      .plus {
        font-size: 1.4rem;
        font-weight: 700;
        color: #14b8a6;
      }
      .add-todo input {
        flex: 1;
        border: none;
        outline: none;
        padding: 0.7rem 0;
        font-size: 1rem;
        color: #f1f5f9;
        background: transparent;
      }
      .add-todo input::placeholder {
        color: #64748b;
      }

      /* Filtres en boutons */
      .filters {
        display: flex;
        gap: 0.5rem;
        margin: 1.25rem 1.75rem 0.5rem;
      }
      .filters button {
        flex: 1;
        padding: 0.6rem 0;
        font-size: 0.9rem;
        font-weight: 600;
        font-family: inherit;
        color: #94a3b8;
        background: transparent;
        border: 2px solid #334155;
        border-radius: 8px;
        cursor: pointer;
        transition:
          color 0.2s,
          border-color 0.2s,
          background 0.2s;
      }
      .filters button:hover {
        color: #f1f5f9;
        border-color: #475569;
      }
      .filters button.active {
        color: #0f172a;
        background: #14b8a6;
        border-color: #14b8a6;
      }

      /* Liste */
      .list {
        list-style: none;
        margin: 0;
        padding: 0.5rem 1.75rem;
      }
      .list li {
        display: flex;
        align-items: center;
        gap: 0.85rem;
        padding: 0.85rem 0.5rem;
        border-radius: 8px;
        transition: background 0.15s;
      }
      .list li:hover {
        background: #273449;
      }
      .list li + li {
        border-top: 1px solid #2b3a50;
      }

      /* Case à cocher ronde personnalisée */
      .check {
        appearance: none;
        width: 22px;
        height: 22px;
        flex-shrink: 0;
        margin: 0;
        border: 2px solid #475569;
        border-radius: 50%;
        cursor: pointer;
        display: grid;
        place-content: center;
        transition:
          background 0.2s,
          border-color 0.2s;
      }
      .check:hover {
        border-color: #14b8a6;
      }
      .check:checked {
        background: #f59e0b;
        border-color: #f59e0b;
      }
      .check:checked::after {
        content: '✓';
        color: #0f172a;
        font-size: 0.8rem;
        font-weight: 700;
      }

      .todo-text {
        flex-grow: 1;
        cursor: pointer;
        font-size: 1rem;
      }
      li.is-done .todo-text {
        text-decoration: line-through;
        color: #64748b;
      }

      /* Champ créé par la directive appEditable */
      .list li > input:not(.check) {
        flex-grow: 1;
        font-size: 1rem;
        padding: 0.35rem 0.5rem !important;
        color: #f1f5f9;
        background: #0f172a;
        border: 2px solid #14b8a6;
        border-radius: 6px;
        outline: none;
      }

      .btn-delete {
        opacity: 0;
        border: none;
        background: rgba(244, 63, 94, 0.15);
        color: #fb7185;
        font-size: 0.75rem;
        font-weight: 600;
        padding: 0.3rem 0.65rem;
        border-radius: 6px;
        cursor: pointer;
        transition:
          opacity 0.15s,
          background 0.15s;
      }
      .list li:hover .btn-delete {
        opacity: 1;
      }
      .btn-delete:hover {
        background: rgba(244, 63, 94, 0.3);
      }

      .empty {
        justify-content: center;
        color: #64748b;
        font-style: italic;
        padding: 2rem 0 !important;
      }
      .list li.empty:hover {
        background: transparent;
      }

      .hint {
        padding: 0.9rem 1.75rem 1.25rem;
        font-size: 0.78rem;
        color: #64748b;
        text-align: center;
      }
    `,
  ],
})
export class TodoListComponent implements OnInit {
  todoService = inject(TodoService);

  // Reçoit automatiquement le query param "statut" (?statut=...)
  statut = input<string | undefined>();
  filter = computed(() => this.statut() ?? 'all');

  // Nombre de tâches encore en cours (affiché dans l'en-tête)
  remaining = computed(
    () => this.todoService.todos().filter((t) => t.status === 'in-progress').length,
  );

  // Dérivation de la liste filtrée
  filteredTodos = computed(() => {
    const currentFilter = this.filter();
    const todos = this.todoService.todos();

    if (currentFilter === 'in-progress') return todos.filter((t) => t.status === 'in-progress');
    if (currentFilter === 'done') return todos.filter((t) => t.status === 'done');
    return todos;
  });

  newTodoText = '';

  ngOnInit() {
    this.todoService.loadTodos();
  }

  add() {
    if (this.newTodoText.trim()) {
      this.todoService.addTodo(this.newTodoText.trim());
      this.newTodoText = '';
    }
  }

  updateText(id: number, newText: string) {
    if (newText.trim()) {
      this.todoService.updateTodo(id, { text: newText.trim() });
    }
  }

  toggleStatus(todo: Todo) {
    const newStatus = todo.status === 'done' ? 'in-progress' : 'done';
    this.todoService.updateTodo(todo.id, { status: newStatus });
  }

  delete(id: number) {
    this.todoService.deleteTodo(id);
  }
}
