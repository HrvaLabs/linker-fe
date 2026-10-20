import { render, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import AddSheet from './AddSheet.svelte';

describe('AddSheet', () => {
  it('does not save an invalid url and shows a hint', async () => {
    const save = vi.fn();
    const { getByLabelText, getByText } = render(AddSheet, { props: { open: true, defaultCat: 'cook' }, events: { save } });

    await fireEvent.input(getByLabelText('Adresa (link)'), { target: { value: 'not a url' } });
    await fireEvent.click(getByText('Spremi link'));

    expect(save).not.toHaveBeenCalled();
    expect(getByText('Upiši ili zalijepi ispravan link.')).toBeTruthy();
  });

  it('saves a valid url, normalized, with the picked category', async () => {
    const detail = vi.fn();
    const { getByLabelText, getByText } = render(AddSheet, {
      props: { open: true, defaultCat: 'cook' },
      events: { save: (e: CustomEvent) => detail(e.detail) },
    });

    await fireEvent.input(getByLabelText('Adresa (link)'), { target: { value: 'konzum.hr' } });
    await fireEvent.click(getByText('Spremi link'));

    expect(detail).toHaveBeenCalledWith(expect.objectContaining({ url: 'https://konzum.hr', cat: 'cook' }));
  });
});
