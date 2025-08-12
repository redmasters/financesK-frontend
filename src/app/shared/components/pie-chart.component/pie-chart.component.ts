import { Component, Input, ViewChild, ElementRef, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  templateUrl: './pie-chart.component.html',
  styleUrl: './pie-chart.component.scss'
})
export class PieChartComponent implements AfterViewInit, OnChanges {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;
  @Input() data: { labels: string[], values: number[], colors: string[] } | null = null;
  chart: any;

  ngAfterViewInit() {
    this.createChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && this.chart) {
      this.updateChart();
    }
  }

  createChart() {
    if (!this.data) return;

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: this.data.labels,
        datasets: [{
          data: this.data.values,
          backgroundColor: this.data.colors,
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right'
          }
        }
      }
    });
  }

  updateChart() {
    if (!this.data || !this.chart) return;

    this.chart.data.labels = this.data.labels;
    this.chart.data.datasets[0].data = this.data.values;
    this.chart.data.datasets[0].backgroundColor = this.data.colors;
    this.chart.update();
  }
}
