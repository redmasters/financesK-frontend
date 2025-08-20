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
            class="btn-secondary"
            (click)="previous()"
          >
            <i class="fas fa-arrow-left"></i>
            Anterior
          </button>

          <button
            *ngIf="tooltip.showSkip"
            class="btn-skip"
            (click)="skip()"
          >
            Pular Tour
          </button>

          <button
            *ngIf="tooltip.showNext"
            class="btn-primary"
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
    .tooltip-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      z-index: 9999;
      pointer-events: auto;
    }

    .element-highlight {
      position: fixed;
      background: transparent;
      border: 3px solid #667eea;
      border-radius: 8px;
      box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6);
      z-index: 10000;
      pointer-events: none;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% {
        border-color: #667eea;
        box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6), 0 0 0 0 rgba(102, 126, 234, 0.7);
      }
      50% {
        border-color: #4fd1c7;
        box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6), 0 0 0 10px rgba(79, 209, 199, 0.3);
      }
      100% {
        border-color: #667eea;
        box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6), 0 0 0 0 rgba(102, 126, 234, 0.7);
      }
    }

    .tooltip-content {
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      max-width: 350px;
      min-width: 300px;
      position: fixed;
      z-index: 10001;
      animation: tooltipAppear 0.3s ease-out;
    }

    @keyframes tooltipAppear {
      from {
        opacity: 0;
        transform: scale(0.8);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    .tooltip-arrow {
      position: absolute;
      width: 0;
      height: 0;
      border: 8px solid transparent;
    }

    .tooltip-top .tooltip-arrow {
      bottom: -16px;
      left: 50%;
      transform: translateX(-50%);
      border-top-color: white;
    }

    .tooltip-bottom .tooltip-arrow {
      top: -16px;
      left: 50%;
      transform: translateX(-50%);
      border-bottom-color: white;
    }

    .tooltip-left .tooltip-arrow {
      right: -16px;
      top: 50%;
      transform: translateY(-50%);
      border-left-color: white;
    }

    .tooltip-right .tooltip-arrow {
      left: -16px;
      top: 50%;
      transform: translateY(-50%);
      border-right-color: white;
    }

    .tooltip-header {
      padding: 20px 20px 10px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;

      h3 {
        margin: 0;
        color: #2c3e50;
        font-size: 1.2rem;
        font-weight: 600;
        flex: 1;
      }

      .btn-close {
        background: none;
        border: none;
        color: #6c757d;
        cursor: pointer;
        padding: 5px;
        border-radius: 4px;
        transition: background-color 0.2s;

        &:hover {
          background: #f8f9fa;
          color: #495057;
        }
      }
    }

    .tooltip-body {
      padding: 0 20px 20px;

      p {
        margin: 0;
        color: #6c757d;
        line-height: 1.5;
        font-size: 0.95rem;
      }
    }

    .tooltip-actions {
      padding: 0 20px 20px;
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border: none;
      padding: 10px 16px;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 6px;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
      }
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
      border: none;
      padding: 10px 16px;
      border-radius: 8px;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 6px;

      &:hover {
        background: #5a6268;
      }
    }

    .btn-skip {
      background: transparent;
      color: #6c757d;
      border: 1px solid #dee2e6;
      padding: 10px 16px;
      border-radius: 8px;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        border-color: #adb5bd;
        color: #495057;
      }
    }

    @media (max-width: 768px) {
      .tooltip-content {
        max-width: 90vw;
        min-width: auto;
        margin: 20px;
      }

      .tooltip-actions {
        flex-wrap: wrap;
        gap: 8px;

        button {
          flex: 1;
          min-width: 120px;
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
