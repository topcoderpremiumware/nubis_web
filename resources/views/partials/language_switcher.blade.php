<div class="lang-dropdown">
  @foreach($available_locales as $locale_name => $available_locale)
    @if($available_locale === $current_locale)
      <span class="lang-dropdown-toggle">
        {{ $locale_name }} &#9662;
      </span>
    @endif
  @endforeach
  <div class="lang-dropdown-menu">
    @foreach($available_locales as $locale_name => $available_locale)
      <a class="lang-dropdown-item" href="/change_lang/{{ $available_locale }}">
        {{ $locale_name }}
      </a>
    @endforeach
  </div>
</div>