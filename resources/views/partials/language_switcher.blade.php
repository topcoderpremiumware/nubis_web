<li class="nav-item dropdown ms-lg-auto">
    @foreach($available_locales as $locale_name => $available_locale)
        @if($available_locale === $current_locale)
            <a class="nav-link dropdown-toggle" type="button" id="languageDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                <span>{{ $locale_name }}</span>
            </a>
        @endif
    @endforeach
    <div class="dropdown-menu" aria-labelledby="languageDropdown">
        @foreach($available_locales as $locale_name => $available_locale)
            <a class="dropdown-item" href="/change_lang/{{ $available_locale }}">
                <span>{{ $locale_name }}</span>
            </a>
        @endforeach
    </div>
</li>
