import { Component, OnInit, AfterViewInit, OnDestroy, inject, signal, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExperienceService } from '../services/experience.service';
import { Experience } from '../models/experience.model';
import * as L from 'leaflet';
import * as d3 from 'd3';

interface TreeNode {
  data: Experience;
  depth: number;
  height: number;
  parent: TreeNode | null;
  x?: number;
  y?: number;
  _children?: TreeNode[];
  children?: TreeNode[];
}

interface LocationGroup {
  location: string;
  lat: number;
  lon: number;
  experiences: Experience[];
}

@Component({
  selector: 'app-experience',
  imports: [CommonModule],
  templateUrl: './experience.component.html',
  styleUrl: './experience.component.scss'
})
export class ExperienceComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly experienceService = inject(ExperienceService);
  private readonly elementRef = inject(ElementRef);

  protected readonly experiences = signal<Experience[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected selectedExperience = signal<Experience | null>(null);
  protected readonly recentExperiences = signal<Experience[]>([]);

  private map?: L.Map;
  private markers: L.Marker[] = [];
  private initialLat = 20;
  private initialLon = 0;
  private initialZoom = 3;

  ngOnInit(): void {
    this.loadExperiences();
  }

  ngAfterViewInit(): void {
    // Initialize map after view is ready
    setTimeout(() => this.initializeMap(), 100);
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private loadExperiences(): void {
    this.loading.set(true);
    this.error.set(null);

    this.experienceService.getAll().subscribe({
      next: (experiences) => {
        this.experiences.set(experiences);
        // Get the 3 most recent experiences for timeline
        const recent = experiences
          .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
          .slice(0, 3);
        this.recentExperiences.set(recent);
        this.loading.set(false);
        setTimeout(() => this.initializeMap(), 100);
      },
      error: (err) => {
        console.error('Error loading experiences:', err);
        this.error.set('Failed to load experience data. Please try again later.');
        this.loading.set(false);
      }
    });
  }

  private initializeMap(): void {
    const mapElement = this.elementRef.nativeElement.querySelector('#experience-map');
    
    if (!mapElement || this.map) {
      return;
    }

    // Set initial view to show the whole US
    this.initialLat = 37.0902;
    this.initialLon = -95.7129;
    this.initialZoom = 4;

    this.map = L.map('experience-map').setView([this.initialLat, this.initialLon], this.initialZoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(this.map);

    const locationGroups = this.groupByLocation(this.experiences());

    // Add markers
    locationGroups.forEach(group => {
      const experience = group.experiences[group.experiences.length - 1];
      const markerColor = this.getMarkerColor(experience.employment_type);
      
      const marker = L.marker([group.lat, group.lon], {
        icon: L.icon({
          iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${markerColor}.png`,
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        })
      });
      
      marker.on('click', () => {
        this.selectedExperience.set(experience);
      });

      marker.addTo(this.map!);
      this.markers.push(marker);
    });
  }

  private groupByLocation(experiences: Experience[]): LocationGroup[] {
    const groups = new Map<string, LocationGroup>();

    experiences.forEach(exp => {
      if (exp.location && exp.lat !== null && exp.lat !== undefined && exp.lon !== null && exp.lon !== undefined) {
        const key = `${exp.lat},${exp.lon}`;
        
        if (!groups.has(key)) {
          groups.set(key, {
            location: exp.location,
            lat: exp.lat as number,
            lon: exp.lon as number,
            experiences: []
          });
        }
        
        groups.get(key)!.experiences.push(exp);
      }
    });

    return Array.from(groups.values());
  }

  private getMarkerColor(employmentType: string): string {
    const colorMap: { [key: string]: string } = {
      'Full-time': 'green',
      'Part-time': 'blue',
      'Contract': 'orange',
      'Freelance': 'violet',
      'Internship': 'red'
    };
    return colorMap[employmentType] || 'grey';
  }

  protected getEmploymentColor(employmentType: string): string {
    const colorMap: { [key: string]: string } = {
      'Full-time': '#22c55e',
      'Part-time': '#3b82f6',
      'Contract': '#f97316',
      'Freelance': '#a855f7',
      'Internship': '#ef4444'
    };
    return colorMap[employmentType] || '#6b7280';
  }

  protected navigateToExperience(experience: Experience): void {
    if (!this.map || experience.lat === null || experience.lat === undefined || experience.lon === null || experience.lon === undefined) {
      return;
    }
    
    // Pan and zoom to the location
    this.map.setView([experience.lat as number, experience.lon as number], 8, {
      animate: true,
      duration: 1
    });
    
    // Show the details
    this.selectedExperience.set(experience);
  }

  protected closePopup(): void {
    this.selectedExperience.set(null);
  }

  protected resetMap(): void {
    if (this.map) {
      this.map.setView([this.initialLat, this.initialLon], this.initialZoom, {
        animate: true,
        duration: 1
      });
    }
    this.selectedExperience.set(null);
  }

  protected getEmploymentTypeColor(employmentType: string): string {
    return this.getEmploymentColor(employmentType);
  }

  protected formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

  protected getDuration(start: string, end: string | undefined): string {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    
    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                   (endDate.getMonth() - startDate.getMonth());
    
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years === 0) {
      return `${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`;
    } else if (remainingMonths === 0) {
      return `${years} ${years === 1 ? 'year' : 'years'}`;
    } else {
      return `${years} ${years === 1 ? 'year' : 'years'} ${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`;
    }
  }
}
