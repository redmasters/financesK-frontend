import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface OnboardingTooltip {
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  targetElement?: string; // ID do elemento alvo
  showSkip?: boolean;
  showNext?: boolean;
  showPrevious?: boolean;
}

@Component({
  selector: 'app-onboarding-tooltip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tooltip-overlay" *ngIf="visible" (click)="onOverlayClick($event)">
      <!-- Highlight do elemento alvo -->
      <div
        *ngIf="targetElementRect"
        class="element-highlight"
        [style.top.px]="targetElementRect.top"
        [style.left.px]="targetElementRect.left"
        [style.width.px]="targetElementRect.width"
        [style.height.px]="targetElementRect.height">
      </div>

      <div
        class="tooltip-content"
        [class]="'tooltip-' + tooltip.position"
        [style.top.px]="tooltipPosition.top"
        [style.left.px]="tooltipPosition.left"
        [style.right.px]="tooltipPosition.right"
        [style.bottom.px]="tooltipPosition.bottom"
      >
        <div class="tooltip-arrow"></div>

        <div class="tooltip-header">
          <h3>{{ tooltip.title }}</h3>
          <button class="btn-close" (click)="close()">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="tooltip-body">
          <p>{{ tooltip.description }}</p>
        </div>

        <div class="tooltip-actions">
          <button
            *ngIf="tooltip.showPrevious"
            class="btn btn-secondary"
            (click)="previous()"
          >
            <i class="fas fa-arrow-left"></i>
            Anterior
          </button>

          <button
            *ngIf="tooltip.showSkip"
            class="btn btn-outline"
            (click)="skip()"
          >
            Pular Tour
          </button>

          <button
            *ngIf="tooltip.showNext"
            class="btn btn-primary"
            (click)="next()"
          >
            Próximo
            <i class="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Importando mixins centralizados */
    @use '../../../shared/styles/mixins' as *;

    /* Estilos específicos do onboarding tooltip usando sistema centralizado */
    .tooltip-overlay {
      @include overlay;
      pointer-events: auto;
    }

    .element-highlight {
      position: fixed;
      background: transparent;
      border: 3px solid var(--primary);
      border-radius: var(--border-radius-sm);
      box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6);
      z-index: 10000;
      pointer-events: none;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% {
        border-color: var(--primary);
        box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6), 0 0 0 0 rgba(67, 97, 238, 0.7);
      }
      50% {
        border-color: var(--success);
        box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6), 0 0 0 10px rgba(16, 185, 129, 0.3);
      }
      100% {
        border-color: var(--primary);
        box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6), 0 0 0 0 rgba(67, 97, 238, 0.7);
      }
    }

    .tooltip-content {
      @include card-md;
      max-width: 380px;
      min-width: 320px;
      position: fixed;
      z-index: 10001;
      animation: tooltipAppear 0.4s ease-out;
      box-shadow: var(--shadow-xl);
    }

    @keyframes tooltipAppear {
      from {
        opacity: 0;
        transform: scale(0.9) translateY(-10px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    .tooltip-arrow {
      position: absolute;
      width: 0;
      height: 0;
      border: 10px solid transparent;
    }

    .tooltip-top .tooltip-arrow {
      bottom: -20px;
      left: 50%;
      transform: translateX(-50%);
      border-top-color: white;
    }

    .tooltip-bottom .tooltip-arrow {
      top: -20px;
      left: 50%;
      transform: translateX(-50%);
      border-bottom-color: white;
    }

    .tooltip-left .tooltip-arrow {
      right: -20px;
      top: 50%;
      transform: translateY(-50%);
      border-left-color: white;
    }

    .tooltip-right .tooltip-arrow {
      left: -20px;
      top: 50%;
      transform: translateY(-50%);
      border-right-color: white;
    }

    .tooltip-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--spacing-md);

      h3 {
        margin: 0;
        color: var(--dark);
        font-size: var(--font-size-xl);
        font-weight: var(--font-weight-bold);
        flex: 1;
        line-height: 1.3;
      }

      .btn-close {
        background: none;
        border: none;
        color: var(--gray);
        cursor: pointer;
        padding: var(--spacing-sm);
        border-radius: var(--border-radius-sm);
        transition: all var(--transition-fast);
        margin-left: var(--spacing-md);

        &:hover {
          background: var(--gray-light);
          color: var(--dark);
        }
      }
    }

    .tooltip-body {
      margin-bottom: var(--spacing-lg);

      p {
        margin: 0;
        color: var(--gray);
        line-height: 1.6;
        font-size: var(--font-size-sm);
      }
    }

    .tooltip-actions {
      display: flex;
      gap: var(--spacing-sm);
      justify-content: flex-end;

      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--spacing-sm);
        padding: var(--spacing-sm) var(--spacing-md);
        border-radius: var(--border-radius-sm);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-semibold);
        cursor: pointer;
        transition: all var(--transition-normal);
        text-decoration: none;
        border: none;
      }

      .btn-primary {
        @include button-gradient;
        box-shadow: 0 4px 12px rgba(67, 97, 238, 0.25);

        &:hover {
          box-shadow: 0 6px 20px rgba(67, 97, 238, 0.35);
        }
      }

      .btn-secondary {
        background: var(--gray);
        color: white;

        &:hover {
          background: var(--gray-dark);
          transform: translateY(-1px);
        }
      }

      .btn-outline {
        background: transparent;
        color: var(--gray);
        border: 2px solid var(--border);

        &:hover {
          border-color: var(--gray);
          color: var(--dark);
          background: rgba(107, 114, 128, 0.05);
        }
      }
    }

    @media (max-width: 768px) {
      .tooltip-content {
        max-width: 90vw;
        min-width: auto;
        margin: var(--spacing-lg);
      }

      .tooltip-header h3 {
        font-size: var(--font-size-lg);
      }

      .tooltip-actions {
        flex-wrap: wrap;
        gap: var(--spacing-sm);

        .btn {
          flex: 1;
          min-width: 120px;
          justify-content: center;
        }
      }
    }
  `]
})
export class OnboardingTooltipComponent {
  @Input() visible = false;
  @Input() tooltip!: OnboardingTooltip;
  @Input() targetElement?: HTMLElement;

  @Output() nextStep = new EventEmitter<void>();
  @Output() previousStep = new EventEmitter<void>();
  @Output() skipTour = new EventEmitter<void>();
  @Output() closeTour = new EventEmitter<void>();

  tooltipPosition: any = {};
  targetElementRect: any;

  ngOnChanges(): void {
    if (this.visible && this.tooltip) {
      setTimeout(() => {
        this.calculateTooltipPosition();
        this.highlightTargetElement();
      }, 100);
    }
  }

  private calculateTooltipPosition(): void {
    if (!this.targetElement) return;

    const rect = this.targetElement.getBoundingClientRect();
    const tooltipWidth = 350;
    const tooltipHeight = 200;
    const margin = 20;

    // Garantir que o tooltip não saia da tela
    let left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
    let top = rect.bottom + margin;

    // Ajustar se sair da tela
    if (left < margin) left = margin;
    if (left + tooltipWidth > window.innerWidth - margin) {
      left = window.innerWidth - tooltipWidth - margin;
    }

    switch (this.tooltip.position) {
      case 'top':
        this.tooltipPosition = {
          left: left,
          bottom: window.innerHeight - rect.top + margin
        };
        break;
      case 'bottom':
        this.tooltipPosition = {
          left: left,
          top: rect.bottom + margin
        };
        break;
      case 'left':
        this.tooltipPosition = {
          right: window.innerWidth - rect.left + margin,
          top: rect.top + (rect.height / 2) - (tooltipHeight / 2)
        };
        break;
      case 'right':
        this.tooltipPosition = {
          left: rect.right + margin,
          top: rect.top + (rect.height / 2) - (tooltipHeight / 2)
        };
        break;
    }
  }

  private highlightTargetElement(): void {
    if (!this.targetElement) return;

    const rect = this.targetElement.getBoundingClientRect();
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const scrollX = window.scrollX || document.documentElement.scrollLeft;

    this.targetElementRect = {
      top: rect.top + scrollY,
      left: rect.left + scrollX,
      width: rect.width,
      height: rect.height
    };
  }

  onOverlayClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  next(): void {
    this.nextStep.emit();
  }

  previous(): void {
    this.previousStep.emit();
  }

  skip(): void {
    this.skipTour.emit();
  }

  close(): void {
    this.closeTour.emit();
  }
}
