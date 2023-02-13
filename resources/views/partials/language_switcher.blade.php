<li>
  @foreach($available_locales as $locale_name => $available_locale)
    @if($available_locale === $current_locale)
      <a class="header-lang header-lang-active" href="/change_lang/{{ $available_locale }}">
        {{ $available_locale }}
      </a>
    @else
      <a class="header-lang" href="/change_lang/{{ $available_locale }}">
        {{ $available_locale }}
      </a>
    @endif
  @endforeach
</li>
