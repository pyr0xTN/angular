import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConferenceService } from '../../services/conference-service';
import { ActivatedRoute, Router } from '@angular/router';
import { Conference } from '../../models/conference';

@Component({
  selector: 'app-conference-form',
  imports: [ReactiveFormsModule],
  templateUrl: './conference-form.html',
  styleUrl: './conference-form.css',
})
export class ConferenceForm {
  private conferenceServ = inject(ConferenceService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  readonly conferenceId = Number(this.route.snapshot.paramMap.get('id'));
  readonly isEditMode = Number.isInteger(this.conferenceId) && this.conferenceId > 0;
  private conferenceToUpdate: Conference | null = null;

  myForm: FormGroup = new FormGroup({
    title : new FormControl('', [Validators.required, Validators.minLength(3)]),
    description : new FormControl('',Validators.required),
    place : new FormControl(''),
    nbmax : new FormControl(''),
    date: new FormControl(''),
  })

  constructor() {
    if (this.isEditMode) {
      this.conferenceServ.getConferenceById(this.conferenceId).subscribe({
        next: (conference) => {
          this.conferenceToUpdate = conference;
          this.myForm.patchValue({
            title: conference.title,
            description: conference.description,
            place: conference.place,
            nbmax: conference.maxParticipants,
            date: conference.date
          });
        },
        error: (error) => console.error('Erreur lors du chargement de la conférence :', error)
      });
    }
  }

  onSubmit() {
    const formValue = this.myForm.value;
    const conference: Conference = {
      id: this.isEditMode ? this.conferenceId : 0,
      title: formValue.title ?? '',
      description: formValue.description ?? '',
      date: formValue.date ?? '',
      place: formValue.place ?? '',
      maxParticipants: Number(formValue.nbmax) || 0,
      nbParticipants: this.conferenceToUpdate?.nbParticipants ?? 0
    };

    const request = this.isEditMode
      ? this.conferenceServ.updateConference(this.conferenceId, conference)
      : this.conferenceServ.addConference(conference);

    request.subscribe({
      next: () => this.router.navigate(['/conferences']),
      error: (error) => console.error('Erreur lors de l’enregistrement de la conférence :', error)
    });
  }
}
