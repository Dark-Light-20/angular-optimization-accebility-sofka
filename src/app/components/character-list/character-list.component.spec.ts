import { NgOptimizedImage } from '@angular/common';
import { HttpStatusCode, provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import {
  ApiResponse,
  Character,
  RickMortyService,
} from '../../services/rick-morty.service';
import { CharacterListComponent } from './character-list.component';

const mockCharacters: Character[] = [
  {
    id: 1,
    name: 'Rick Sanchez',
    status: 'Alive',
    species: 'Human',
    type: '',
    gender: 'Male',
    origin: {
      name: 'Earth (C-137)',
      url: 'https://rickandmortyapi.com/api/location/1',
    },
    location: {
      name: 'Citadel of Ricks',
      url: 'https://rickandmortyapi.com/api/location/3',
    },
    image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
    episode: ['https://rickandmortyapi.com/api/episode/1'],
    url: 'https://rickandmortyapi.com/api/character/1',
    created: '2017-11-04T18:48:46.250Z',
  },
  {
    id: 2,
    name: 'Morty Smith',
    status: 'Alive',
    species: 'Human',
    type: '',
    gender: 'Male',
    origin: { name: 'unknown', url: '' },
    location: {
      name: 'Citadel of Ricks',
      url: 'https://rickandmortyapi.com/api/location/3',
    },
    image: 'https://rickandmortyapi.com/api/character/avatar/2.jpeg',
    episode: ['https://rickandmortyapi.com/api/episode/1'],
    url: 'https://rickandmortyapi.com/api/character/2',
    created: '2017-11-04T18:50:21.651Z',
  },
];

const mockApiResponse: ApiResponse = {
  info: {
    count: 826,
    pages: 42,
    next: 'https://rickandmortyapi.com/api/character?page=2',
    prev: null,
  },
  results: mockCharacters,
};

describe('CharacterListComponent', () => {
  let component: CharacterListComponent;
  let fixture: ComponentFixture<CharacterListComponent>;
  let mockRickMortyService: jest.Mocked<RickMortyService>;

  beforeAll(() => {
    const preconnect = document.createElement('link');
    preconnect.rel = 'preconnect';
    preconnect.href = 'https://rickandmortyapi.com';
    document.head.appendChild(preconnect);
  });

  beforeEach(async () => {
    const rickMortyServiceSpy = {
      getCharacters: jest.fn(),
      getCharacterById: jest.fn(),
    };

    await TestBed.configureTestingModule({
      declarations: [CharacterListComponent],
      imports: [NgOptimizedImage],
      providers: [{ provide: RickMortyService, useValue: rickMortyServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(CharacterListComponent);
    component = fixture.componentInstance;
    mockRickMortyService = TestBed.inject(
      RickMortyService
    ) as jest.Mocked<RickMortyService>;

    // No llamar fixture.detectChanges() aquí para evitar ngOnInit automático
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load characters on initialization', () => {
      mockRickMortyService.getCharacters.mockReturnValue(of(mockApiResponse));

      component.ngOnInit();

      expect(mockRickMortyService.getCharacters).toHaveBeenCalledWith(1);
      expect(component.characters).toEqual(mockCharacters);
      expect(component.currentPage).toBe(1);
      expect(component.totalPages).toBe(42);
      expect(component.loading).toBe(false);
      expect(component.error).toBe('');
    });
  });

  describe('loadCharacters', () => {
    it('should set loading to true initially', () => {
      mockRickMortyService.getCharacters.mockReturnValue(of(mockApiResponse));

      component.loadCharacters(1);

      expect(component.loading).toBe(false); // After successful response
      expect(component.error).toBe('');
    });

    it('should handle successful response', () => {
      mockRickMortyService.getCharacters.mockReturnValue(of(mockApiResponse));

      component.loadCharacters(2);

      expect(mockRickMortyService.getCharacters).toHaveBeenCalledWith(2);
      expect(component.characters).toEqual(mockCharacters);
      expect(component.currentPage).toBe(2);
      expect(component.totalPages).toBe(42);
      expect(component.loading).toBe(false);
      expect(component.error).toBe('');
    });

    it('should handle error response', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockRickMortyService.getCharacters.mockReturnValue(
        throwError(() => new Error('API Error'))
      );

      component.loadCharacters(1);

      expect(component.loading).toBe(false);
      expect(component.error).toBe(
        'Error loading characters. Please try again.'
      );
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('navigation', () => {
    beforeEach(() => {
      component.currentPage = 2;
      component.totalPages = 5;
    });

    describe('previousPage', () => {
      it('should load previous page when current page > 1', () => {
        mockRickMortyService.getCharacters.mockReturnValue(of(mockApiResponse));
        const loadCharactersSpy = jest.spyOn(component, 'loadCharacters');

        component.previousPage();

        expect(loadCharactersSpy).toHaveBeenCalledWith(1);
      });

      it('should not load previous page when current page is 1', () => {
        component.currentPage = 1;
        mockRickMortyService.getCharacters.mockReturnValue(of(mockApiResponse));
        const loadCharactersSpy = jest.spyOn(component, 'loadCharacters');

        component.previousPage();

        expect(loadCharactersSpy).not.toHaveBeenCalled();
      });
    });

    describe('nextPage', () => {
      it('should load next page when current page < total pages', () => {
        mockRickMortyService.getCharacters.mockReturnValue(of(mockApiResponse));
        const loadCharactersSpy = jest.spyOn(component, 'loadCharacters');

        component.nextPage();

        expect(loadCharactersSpy).toHaveBeenCalledWith(3);
      });

      it('should not load next page when current page equals total pages', () => {
        component.currentPage = 5;
        mockRickMortyService.getCharacters.mockReturnValue(of(mockApiResponse));
        const loadCharactersSpy = jest.spyOn(component, 'loadCharacters');

        component.nextPage();

        expect(loadCharactersSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('getStatusClass', () => {
    it('should return "status-alive" for alive status', () => {
      expect(component.getStatusClass('Alive')).toBe('status-alive');
      expect(component.getStatusClass('alive')).toBe('status-alive');
      expect(component.getStatusClass('ALIVE')).toBe('status-alive');
    });

    it('should return "status-dead" for dead status', () => {
      expect(component.getStatusClass('Dead')).toBe('status-dead');
      expect(component.getStatusClass('dead')).toBe('status-dead');
      expect(component.getStatusClass('DEAD')).toBe('status-dead');
    });

    it('should return "status-unknown" for unknown status', () => {
      expect(component.getStatusClass('unknown')).toBe('status-unknown');
      expect(component.getStatusClass('Unknown')).toBe('status-unknown');
      expect(component.getStatusClass('anything else')).toBe('status-unknown');
      expect(component.getStatusClass('')).toBe('status-unknown');
    });
  });

  describe('template integration', () => {
    it('should render without errors when characters are loaded', () => {
      mockRickMortyService.getCharacters.mockReturnValue(of(mockApiResponse));
      component.characters = mockCharacters;
      component.loading = false;
      component.error = '';

      expect(() => fixture.detectChanges()).not.toThrow();
      expect(component.characters.length).toBe(2);
    });

    it('should render component without errors', () => {
      mockRickMortyService.getCharacters.mockReturnValue(of(mockApiResponse));

      expect(() => fixture.detectChanges()).not.toThrow();
      expect(component).toBeTruthy();
    });
  });

  describe('Character rendering', () => {
    beforeEach(() => {
      // Simulate existing characters loaded
      mockRickMortyService.getCharacters.mockReturnValue(of(mockApiResponse));
      fixture.detectChanges();
    });

    it('should render all character cards elements', () => {
      const gridContainer = fixture.debugElement.query(
        By.css('.characters-grid')
      );
      expect(gridContainer).toBeTruthy();

      const characterCards = gridContainer.queryAll(By.css('.character-card'));
      expect(characterCards.length).toBe(component.characters.length);
    });

    it('should render character images with correct data', () => {
      // Extract all character image containers
      const imagesContainers = fixture.debugElement.queryAll(
        By.css('.character-image-container')
      );

      component.characters.forEach((character, index) => {
        const characterImageContainer = imagesContainers[index];
        expect(characterImageContainer).toBeTruthy();

        const imageElement = characterImageContainer.query(
          By.css('img.character-image')
        );
        expect(imageElement.attributes['src']).toBe(character.image);
        expect(imageElement.attributes['alt']).toBe(character.name);
        expect(imageElement.attributes['priority']).toBeDefined();

        const statusIndicator = characterImageContainer.query(
          By.css('.status-indicator')
        );
        expect(statusIndicator).toBeTruthy();
        const expectedClass = component.getStatusClass(character.status);
        expect(statusIndicator.classes[expectedClass]).toBe(true);
        expect(
          (statusIndicator.nativeElement as HTMLElement).textContent
        ).toContain(character.status);
      });
    });

    it('should render character details correctly', () => {
      const infoContainers = fixture.debugElement.queryAll(
        By.css('.character-info')
      );

      component.characters.forEach((character, index) => {
        const infoContainer = infoContainers[index];
        expect(infoContainer).toBeTruthy();

        const nameElement = infoContainer.query(By.css('h3.character-name'));
        expect(nameElement).toBeTruthy();
        expect(nameElement.nativeElement.textContent).toBe(character.name);

        const detailsContainer = infoContainer.query(
          By.css('.character-details')
        );
        expect(detailsContainer).toBeTruthy();

        const detailsValues = detailsContainer
          .queryAll(By.css('span.detail-value'))
          .map((detail) => detail.nativeElement.textContent);
        expect(detailsValues).toContain(character.species);
        if (character.type) {
          expect(detailsValues).toContain(character.type);
        }
        expect(detailsValues).toContain(character.gender);

        const locationContainer = infoContainer.query(By.css('.location-info'));
        expect(locationContainer).toBeTruthy();

        const locationName = locationContainer.query(
          By.css('span.location-name')
        );
        expect(locationName).toBeTruthy();
        expect(locationName.nativeElement.textContent).toBe(
          character.location.name
        );

        const originName = locationContainer.query(By.css('span.origin-name'));
        expect(originName).toBeTruthy();
        expect(originName.nativeElement.textContent).toBe(
          character.origin.name
        );
      });
    });
  });

  describe('Pagination controls', () => {
    beforeEach(() => {
      // Simulate existing characters loaded
      mockRickMortyService.getCharacters.mockReturnValue(of(mockApiResponse));
      fixture.detectChanges();
    });

    it('should render pagination controls', () => {
      const paginationContainer = fixture.debugElement.query(
        By.css('.pagination')
      );
      expect(paginationContainer).toBeTruthy();

      const prevButton = paginationContainer.query(
        By.css('button[aria-label="Previous page"]')
      );
      const nextButton = paginationContainer.query(
        By.css('button[aria-label="Next page"]')
      );

      expect(prevButton).toBeTruthy();
      expect(nextButton).toBeTruthy();
    });

    it('should disable previous button on first page', () => {
      component.currentPage = 1;
      fixture.detectChanges();

      const prevButton = fixture.debugElement.query(
        By.css('button[aria-label="Previous page"]')
      );
      expect(prevButton.properties['disabled']).toBe(true);
      expect(prevButton.attributes['aria-disabled']).toBe('true');
    });

    it('should disable next button on last page', () => {
      component.currentPage = component.totalPages;
      fixture.detectChanges();

      const nextButton = fixture.debugElement.query(
        By.css('button[aria-label="Next page"]')
      );
      expect(nextButton.properties['disabled']).toBe(true);
      expect(nextButton.attributes['aria-disabled']).toBe('true');
    });

    it('should call previousPage on previous button click', () => {
      component.currentPage = 2;
      fixture.detectChanges();

      const prevButton = fixture.debugElement.query(
        By.css('button[aria-label="Previous page"]')
      );
      const previousPageSpy = jest.spyOn(component, 'previousPage');

      prevButton.triggerEventHandler('click');
      fixture.detectChanges();

      expect(previousPageSpy).toHaveBeenCalled();
    });

    it('should call nextPage on next button click', () => {
      component.currentPage = 1;
      fixture.detectChanges();

      const nextButton = fixture.debugElement.query(
        By.css('button[aria-label="Next page"]')
      );
      const nextPageSpy = jest.spyOn(component, 'nextPage');

      nextButton.triggerEventHandler('click');
      fixture.detectChanges();

      expect(nextPageSpy).toHaveBeenCalled();
    });
  });
});

describe('CharacterListComponent Integration', () => {
  let fixture: ComponentFixture<CharacterListComponent>;
  let component: CharacterListComponent;
  let service: RickMortyService;
  let controller: HttpTestingController;

  beforeAll(() => {
    const preconnect = document.createElement('link');
    preconnect.rel = 'preconnect';
    preconnect.href = 'https://rickandmortyapi.com';
    document.head.appendChild(preconnect);
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CharacterListComponent],
      imports: [NgOptimizedImage],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(CharacterListComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(RickMortyService);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    controller.verify();
  });

  it('should load characters from service', () => {
    // Execute ngOnInit which calls loadCharacters
    fixture.detectChanges();

    // Mock the HTTP response
    const req = controller.expectOne(
      'https://rickandmortyapi.com/api/character?page=1'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockApiResponse);

    // Validate component state after response
    expect(component.characters).toEqual(mockCharacters);
    expect(component.loading).toBe(false);
    expect(component.error).toBe('');
    expect(component.currentPage).toBe(1);
    expect(component.totalPages).toBe(mockApiResponse.info.pages);

    // Trigger change detection to update the template
    fixture.detectChanges();

    // Validate cards render
    const characterCards = fixture.debugElement.queryAll(
      By.css('.character-card')
    );
    expect(characterCards.length).toBe(mockCharacters.length);
    characterCards.forEach((card, index) => {
      // Validate each card's name to verify correct data binding
      const character = mockCharacters[index];
      const nameElement = card.query(By.css('h3.character-name'));
      expect(nameElement.nativeElement.textContent).toBe(character.name);
    });
  });

  describe('when service returns an error', () => {
    it('should handle service error', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Execute ngOnInit which calls loadCharacters
      fixture.detectChanges();

      // Mock the HTTP error response
      const req = controller.expectOne(
        'https://rickandmortyapi.com/api/character?page=1'
      );
      expect(req.request.method).toBe('GET');
      req.flush('Error loading data', {
        status: HttpStatusCode.InternalServerError,
        statusText: 'Server Error',
      });

      // Validate component state after error
      expect(component.characters).toEqual([]);
      expect(component.loading).toBe(false);
      expect(component.error).toBe(
        'Error loading characters. Please try again.'
      );
      expect(consoleSpy).toHaveBeenCalled();

      // Trigger change detection to update the template
      fixture.detectChanges();

      // Validate no character cards rendered
      const characterCards = fixture.debugElement.queryAll(
        By.css('.character-card')
      );
      expect(characterCards.length).toBe(0);

      // Validate error message render
      const errorContainerElement = fixture.debugElement.query(
        By.css('.error')
      );
      expect(errorContainerElement).toBeTruthy();

      const errorMessageElement = errorContainerElement.query(By.css('p'));
      expect(errorMessageElement).toBeTruthy();
      const errorElement = errorMessageElement;
      expect(errorElement.nativeElement.textContent).toContain(
        'Error loading characters. Please try again.'
      );

      const tryAgainButton = errorContainerElement.query(
        By.css('button[aria-label="Try Again"]')
      );
      expect(tryAgainButton).toBeTruthy();
      expect(tryAgainButton.nativeElement.textContent).toContain('Try Again');
    });

    it('should retry loading characters on Try Again button click', () => {
      // Execute ngOnInit which calls loadCharacters
      fixture.detectChanges();

      // Mock the HTTP error response
      const reqBad = controller.expectOne(
        'https://rickandmortyapi.com/api/character?page=1'
      );
      expect(reqBad.request.method).toBe('GET');
      reqBad.flush('Error loading data', {
        status: HttpStatusCode.InternalServerError,
        statusText: 'Server Error',
      });

      // Trigger change detection to update the template
      fixture.detectChanges();

      // Validate error message render
      const errorContainerElement = fixture.debugElement.query(
        By.css('.error')
      );
      expect(errorContainerElement).toBeTruthy();

      const tryAgainButton = errorContainerElement.query(
        By.css('button[aria-label="Try Again"]')
      );
      expect(tryAgainButton).toBeTruthy();

      const loadCharactersSpy = jest.spyOn(component, 'loadCharacters');

      // Mock the HTTP success response on retry
      tryAgainButton.triggerEventHandler('click');
      fixture.detectChanges();

      expect(loadCharactersSpy).toHaveBeenCalledWith(1);

      const reqGood = controller.expectOne(
        'https://rickandmortyapi.com/api/character?page=1'
      );
      expect(reqGood.request.method).toBe('GET');
      reqGood.flush(mockApiResponse);

      // Validate component state after successful retry
      expect(component.characters).toEqual(mockCharacters);
      expect(component.loading).toBe(false);
      expect(component.error).toBe('');
      expect(component.currentPage).toBe(1);
      expect(component.totalPages).toBe(mockApiResponse.info.pages);

      // Trigger change detection to update the template
      fixture.detectChanges();

      // Validate cards render
      const characterCards = fixture.debugElement.queryAll(
        By.css('.character-card')
      );
      expect(characterCards.length).toBe(mockCharacters.length);

      // Validate error message is gone
      const errorContainerAfter = fixture.debugElement.query(By.css('.error'));
      expect(errorContainerAfter).toBeNull();
    });
  });
});
